import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CategoryForm from "@/components/cms/category/CategoryForm";
import type { Locale } from "@/i18n/config";

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <CategoryForm lang={lang as Locale} mode="create" dict={dict.cms.category.form} />;
}
