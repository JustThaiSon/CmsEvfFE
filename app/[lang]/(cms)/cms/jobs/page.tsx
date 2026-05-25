import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import JobList from "@/components/cms/job/JobList";
import type { Locale } from "@/i18n/config";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return <JobList lang={lang as Locale} dict={dict.cms.job.list} />;
}
