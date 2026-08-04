import type { Locale } from "@/lib/i18n/locales";

// Пока переведён только небольшой представительный срез UI (навигация +
// блок настроек в профиле) — это инфраструктура для дальнейшего перевода
// остального интерфейса по разделам, не полный перевод сайта.
const ru = {
  nav: {
    menu: "Меню",
    history: "История",
    about: "О нас",
    profile: "Профиль",
  },
  settings: {
    language: "Язык",
    theme: "Тёмная тема",
    referral: "Пригласить друзей",
  },
};

const tj: typeof ru = {
  nav: {
    menu: "Меню",
    history: "Таърих",
    about: "Дар бораи мо",
    profile: "Танзимот",
  },
  settings: {
    language: "Забон",
    theme: "Реҷаи шабона",
    referral: "Даъват кардани дӯстон",
  },
};

const en: typeof ru = {
  nav: {
    menu: "Menu",
    history: "History",
    about: "About",
    profile: "Profile",
  },
  settings: {
    language: "Language",
    theme: "Dark mode",
    referral: "Invite friends",
  },
};

export type Dictionary = typeof ru;

const DICTIONARIES: Record<Locale, Dictionary> = { ru, tj, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
