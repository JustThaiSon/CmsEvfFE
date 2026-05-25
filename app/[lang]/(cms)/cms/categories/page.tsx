import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CategoryList from "@/components/cms/category/CategoryList";
import type { Locale } from "@/i18n/config";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <CategoryList lang={lang as Locale} dict={dict.cms.category.list} />;
}
