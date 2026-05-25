import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import ContactRequestList from "@/components/cms/contact-request/ContactRequestList";
import type { Locale } from "@/i18n/config";

export default async function ContactRequestsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <ContactRequestList lang={lang as Locale} dict={dict.cms.contactRequest.list} />
  );
}
