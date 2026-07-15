"use client";

import { useState } from "react";
import Link from "next/link";
import { TierCards } from "@/components/TierCards";

// Кнопка "Далее" в уроке: если следующий урок открыт — обычная ссылка;
// если закрыт тарифом — вместо перехода всплывает окно с тарифами.
export function NextLessonButton({
  nextLessonId,
  locked,
  requiredLabel,
}: {
  nextLessonId: string;
  locked: boolean;
  requiredLabel: string;
}) {
  const [open, setOpen] = useState(false);

  if (!locked) {
    return (
      <Link href={`/lessons/${nextLessonId}`} className="btn-primary">
        Далее →
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Далее →
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-ink-800/95 p-6 shadow-glow-lg backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="badge border-brand/40 text-brand-light">🔒 Следующий урок</span>
                <h2 className="mt-2 text-xl font-bold">Доступен на тарифе {requiredLabel}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Выберите тариф, чтобы продолжить курс без ограничений.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <TierCards />
            </div>

            <Link href="/billing" className="mt-4 block text-center text-sm text-slate-400 hover:text-white">
              Сравнить все тарифы →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
