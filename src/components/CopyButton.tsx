"use client";

import { useState } from "react";

// Кнопка "скопировать" рядом с номером телефона/именем получателя в реквизитах.
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API недоступен (старый браузер/не-https) — кнопка просто не сработает.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Скопировать"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors duration-300 hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-emerald-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path strokeLinecap="round" d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      )}
    </button>
  );
}
