import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function SiteLayout({
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
    <>
      <Header lang={lang as Locale} />
      {children}
      <Footer lang={lang as Locale} />
    </>
  );
}
