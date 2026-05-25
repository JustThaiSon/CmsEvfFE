import type { CommonResponse } from "@/types/api";
import type { LoginReq, LoginRes } from "@/types/auth";
import { api } from "./api";

export async function login(req: LoginReq): Promise<CommonResponse<LoginRes>> {
  const { data } = await api.post<CommonResponse<LoginRes>>("/api/Auth/Login", req);
  return data;
}
