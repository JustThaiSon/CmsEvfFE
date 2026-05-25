"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RESPONSE_CODE } from "@/constants/auth";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth-storage";
import { login as loginApi } from "@/services/auth.api";
import type { AxiosError } from "axios";
import type { CommonResponse } from "@/types/api";

type LoginResult = {
  success: boolean;
  message: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (userName: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<CommonResponse<unknown>>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAccessToken());
    setIsReady(true);
  }, []);

  const login = useCallback(async (userName: string, password: string): Promise<LoginResult> => {
    try {
      const res = await loginApi({ userName, password });

      if (res.responseCode === RESPONSE_CODE.SUCCESS && res.data?.accessToken) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setIsAuthenticated(true);
        return { success: true, message: res.message };
      }

      return {
        success: false,
        message: res.message || "Đăng nhập thất bại",
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, "Không thể kết nối máy chủ. Kiểm tra API đang chạy."),
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isReady, login, logout }),
    [isAuthenticated, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
