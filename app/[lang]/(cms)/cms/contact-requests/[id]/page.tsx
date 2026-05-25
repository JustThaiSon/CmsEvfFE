import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import ContactRequestDetailView from "@/components/cms/contact-request/ContactRequestDetailView";
import type { Locale } from "@/i18n/config";

export default async function ContactRequestDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <ContactRequestDetailView
      lang={lang as Locale}
      id={id}
      dict={dict.cms.contactRequest.detail}
    />
  );
}
