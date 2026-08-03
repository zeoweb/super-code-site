"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locales";

// Переключатель языка (тj/ru/en). Меняет cookie на сервере и обновляет
// текущий роут, чтобы серверные компоненты перечитали словарь.
export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function select(locale: Locale) {
    if (locale === current) return;
    startTransition(async () => {
      await setLocaleAction(locale);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => select(locale)}
          disabled={isPending}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-300 disabled:opacity-60 ${
            locale === current ? "bg-brand text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {LOCALE_NAMES[locale]}
        </button>
      ))}
    </div>
  );
}
