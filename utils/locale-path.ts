import { defaultLocale, type Locale } from "@/i18n/config";

export function localePath(href: string, lang: Locale): string {
  if (lang === defaultLocale) return href;
  return `/${lang}${href}`;
}
