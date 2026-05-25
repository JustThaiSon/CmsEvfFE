"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "antd";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale prefix from pathname
    let basePath = pathname;
    const currentLocale = locales.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
    );
    if (currentLocale) {
      basePath = pathname.replace(`/${currentLocale}`, "") || "/";
    }

    // Default locale has no prefix
    if (newLocale === defaultLocale) {
      router.push(basePath);
    } else {
      router.push(`/${newLocale}${basePath}`);
    }
  };

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <Button
          key={locale}
          type={locale === lang ? "primary" : "default"}
          size="small"
          onClick={() => switchLocale(locale)}
        >
          {locale === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
        </Button>
      ))}
    </div>
  );
}
