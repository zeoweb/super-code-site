"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { landingText, type LandingLang } from "@/lib/i18n/landing";

const STORAGE_KEY = "supercode_lang";

type LanguageContextValue = {
  lang: LandingLang;
  setLang: (lang: LandingLang) => void;
  t: (typeof landingText)[LandingLang];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Оборачивает лендинг: хранит текущий язык (RU/TJ) и синхронизирует его с localStorage.
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LandingLang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ru" || saved === "tj") setLangState(saved);
  }, []);

  function setLang(next: LandingLang) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: landingText[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage должен использоваться внутри LanguageProvider");
  return ctx;
}
