"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spin } from "antd";
import type { Locale } from "@/i18n/config";
import { ROUTES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { localePath } from "@/utils/locale-path";

type CmsAuthGuardProps = {
  lang: Locale;
  children: React.ReactNode;
};

export default function CmsAuthGuard({ lang, children }: CmsAuthGuardProps) {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      const loginUrl = localePath(ROUTES.LOGIN, lang);
      const redirect = encodeURIComponent(pathname);
      router.replace(`${loginUrl}?redirect=${redirect}`);
    }
  }, [isAuthenticated, isReady, lang, pathname, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
