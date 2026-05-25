import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import NewList from "@/components/cms/new/NewList";
import type { Locale } from "@/i18n/config";

export default async function CmsPostsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <NewList lang={lang as Locale} dict={dict.cms.new.list} />;
}
