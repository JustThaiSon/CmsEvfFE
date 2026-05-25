import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { CMS_DEFAULT_ROUTE } from "@/constants";
import { localePath } from "@/utils/locale-path";

export default async function CmsRootPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  await getDictionary(lang);

  redirect(localePath(CMS_DEFAULT_ROUTE, lang));
}
