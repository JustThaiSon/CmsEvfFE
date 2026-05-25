import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Spin } from "antd";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import LoginForm from "@/components/auth/LoginForm";
import type { Locale } from "@/i18n/config";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <LoginForm lang={lang as Locale} dict={dict.auth.login} />
    </Suspense>
  );
}
