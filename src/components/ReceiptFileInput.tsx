"use client";

import { useRef, useState } from "react";

// Стилизованный выбор файла чека: строка с иконкой + именем файла + кнопка "Выбрать/Заменить".
export function ReceiptFileInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div>
      <label htmlFor="receipt" className="label">Скриншот перевода</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/5 p-3 text-left transition-colors duration-300 hover:border-brand/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
          🧾
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
          {fileName ?? "Скриншот перевода"}
        </span>
        <span className="shrink-0 text-sm font-medium text-brand-light">
          {fileName ? "Заменить" : "Выбрать"}
        </span>
      </button>
      <input
        ref={inputRef}
        id="receipt"
        name="receipt"
        type="file"
        accept="image/*,application/pdf"
        required
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <p className="mt-1 text-xs text-slate-500">PNG/JPG/WEBP или PDF, до 8 МБ.</p>
    </div>
  );
}
