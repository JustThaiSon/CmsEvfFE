import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import JobForm from "@/components/cms/job/JobForm";
import type { Locale } from "@/i18n/config";

export default async function JobCreatePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <JobForm lang={lang as Locale} mode="create" dict={dict.cms.job.form} />;
}
