import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CmsPageContent from "@/components/cms/CmsPageContent";

export default async function CmsPagesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <CmsPageContent
      title={dict.cms.pages.pages.title}
      description={dict.cms.pages.pages.description}
    />
  );
}
