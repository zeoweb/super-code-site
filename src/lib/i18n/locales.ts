export const LOCALES = ["ru", "tj", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: "Русский",
  tj: "Тоҷикӣ",
  en: "English",
};

// BCP-47 тег для <html lang>. Таджикский — "tg", не "tj" (tj — код страны).
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  ru: "ru",
  tj: "tg",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
