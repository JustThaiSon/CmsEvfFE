import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import AntdRegistry from "@/components/providers/AntdRegistry";
import { AuthProvider } from "@/contexts/AuthContext";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  return (
    <html lang={lang}>
      <body className="antialiased">
        <AntdRegistry>
          <AuthProvider>{children}</AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
