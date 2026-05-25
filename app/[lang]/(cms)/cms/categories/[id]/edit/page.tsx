import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CategoryForm from "@/components/cms/category/CategoryForm";
import type { Locale } from "@/i18n/config";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <CategoryForm
      lang={lang as Locale}
      mode="edit"
      categoryId={id}
      dict={dict.cms.category.form}
    />
  );
}
