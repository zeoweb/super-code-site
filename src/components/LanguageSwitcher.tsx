"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-[11px] font-semibold backdrop-blur-xl sm:text-xs">
      <button
        onClick={() => setLang("ru")}
        aria-pressed={lang === "ru"}
        className={
          "rounded-full px-1 py-1 transition-colors duration-300 sm:px-2.5 " +
          (lang === "ru" ? "bg-brand-gradient text-white" : "text-slate-400 hover:text-white")
        }
      >
        RU
      </button>
      <button
        onClick={() => setLang("tj")}
        aria-pressed={lang === "tj"}
        className={
          "rounded-full px-1 py-1 transition-colors duration-300 sm:px-2.5 " +
          (lang === "tj" ? "bg-brand-gradient text-white" : "text-slate-400 hover:text-white")
        }
      >
        ТҶ
      </button>
    </div>
  );
}
