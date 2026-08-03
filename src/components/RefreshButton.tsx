"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function refresh() {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 500);
  }

  return (
    <button
      type="button"
      onClick={refresh}
      aria-label="Обновить"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors duration-300 hover:bg-slate-200 hover:text-slate-900"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className={`h-5 w-5 transition-transform duration-500 ${spinning ? "rotate-180" : ""}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 4.5v3h-3M6.5 19.5v-3h3" />
      </svg>
    </button>
  );
}
