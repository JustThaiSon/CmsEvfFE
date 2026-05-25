import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CmsAuthGuard from "@/components/auth/CmsAuthGuard";
import CmsShell from "@/components/cms/CmsShell";

export default async function CmsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <CmsAuthGuard lang={lang as Locale}>
      <CmsShell lang={lang as Locale} dict={dict.cms}>
        {children}
      </CmsShell>
    </CmsAuthGuard>
  );
}
