"use client";

import { useState } from "react";
import { setThemeAction } from "@/app/actions/theme";

// Переключатель тёмной темы. Класс "dark" на <html> переключается сразу
// (без ожидания сервера) — cookie/localStorage только персистят выбор для
// следующей загрузки/SSR.
export function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = useState(initialDark);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    void setThemeAction(next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
        dark ? "bg-brand" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
          dark ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
