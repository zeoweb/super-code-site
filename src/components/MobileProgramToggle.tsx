"use client";

import { useState } from "react";

// Кнопка "☰ Программа" на мобильных — разворачивает список уроков курса
// (тот же контент, что в десктопном сайдбаре) прямо под кнопками действий.
export function MobileProgramToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="btn-ghost">
        ☰ Программа
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
