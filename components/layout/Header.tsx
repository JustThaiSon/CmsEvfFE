import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { NAV_LINKS } from "@/constants";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { localePath } from "@/utils/locale-path";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header({ lang }: { lang: Locale }) {
  const dict = await getDictionary(lang);

  return (
    <header className="bg-white shadow px-6 py-3 flex items-center justify-between">
      <nav className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.key}
            href={localePath(link.href, lang)}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            {dict.nav[link.key]}
          </Link>
        ))}
      </nav>
      <LanguageSwitcher lang={lang} />
    </header>
  );
}
