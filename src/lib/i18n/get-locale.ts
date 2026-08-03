import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/locales";

const LOCALE_COOKIE = "locale";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value ?? "";
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export { LOCALE_COOKIE };
