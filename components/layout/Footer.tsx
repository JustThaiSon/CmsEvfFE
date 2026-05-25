import type { Locale } from "@/i18n/config";

export default function Footer({ lang }: { lang: Locale }) {
  return (
    <footer className="bg-gray-50 border-t px-6 py-4 text-center text-sm text-gray-500">
      {lang === "vi" ? "© 2026 EVF. Bản quyền thuộc về EVF." : "© 2026 EVF. All rights reserved."}
    </footer>
  );
}
