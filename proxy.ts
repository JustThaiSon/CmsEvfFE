import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { locales, defaultLocale } from "@/i18n/config";

const nonDefaultLocales = locales.filter((l) => l !== defaultLocale);

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return defaultLocale;

  const languages = new Negotiator({
    headers: { "accept-language": acceptLanguage },
  }).languages();

  if (languages.length === 0 || languages.every((l) => l === "*")) {
    return defaultLocale;
  }

  try {
    return match(languages, [...locales], defaultLocale);
  } catch {
    return defaultLocale;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If path starts with default locale prefix, strip it and redirect
  // e.g. /vi/about → /about
  if (
    pathname.startsWith(`/${defaultLocale}/`) ||
    pathname === `/${defaultLocale}`
  ) {
    const newPath = pathname.replace(`/${defaultLocale}`, "") || "/";
    request.nextUrl.pathname = newPath;
    return NextResponse.redirect(request.nextUrl);
  }

  // If path starts with a non-default locale, allow it through
  const hasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (hasNonDefaultLocale) return;

  // No locale prefix — detect preferred locale
  const locale = getLocale(request);

  // Default locale: rewrite internally to /vi/... (URL stays clean)
  if (locale === defaultLocale) {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(request.nextUrl);
  }

  // Non-default locale: redirect to /en/...
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
