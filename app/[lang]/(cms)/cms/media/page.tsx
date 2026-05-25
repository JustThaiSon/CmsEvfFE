import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import CmsPageContent from "@/components/cms/CmsPageContent";

export default async function CmsMediaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <CmsPageContent
      title={dict.cms.pages.media.title}
      description={dict.cms.pages.media.description}
    />
  );
}
