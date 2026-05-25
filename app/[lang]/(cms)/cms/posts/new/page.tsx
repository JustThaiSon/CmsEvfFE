import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import NewForm from "@/components/cms/new/NewForm";
import type { Locale } from "@/i18n/config";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <NewForm lang={lang as Locale} mode="create" dict={dict.cms.new.form} />;
}
