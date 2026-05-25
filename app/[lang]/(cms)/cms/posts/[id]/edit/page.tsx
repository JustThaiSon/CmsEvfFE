import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import NewForm from "@/components/cms/new/NewForm";
import type { Locale } from "@/i18n/config";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <NewForm lang={lang as Locale} mode="edit" newId={id} dict={dict.cms.new.form} />
  );
}
