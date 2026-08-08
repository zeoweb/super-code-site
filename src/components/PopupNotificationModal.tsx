"use client";

import { useState } from "react";
import { dismissPopupNotification } from "@/app/actions/notifications";

// Важное уведомление, которое нельзя пропустить в колокольчике — всплывает
// при заходе на сайт, пока пользователь его не закроет (после этого больше
// не появляется, см. dismissPopupNotification). Закрыть можно в любой
// момент — сайт под ней не блокируется.
export function PopupNotificationModal({
  id,
  message,
  actionLabel,
  actionUrl,
}: {
  id: string;
  message: string;
  actionLabel?: string | null;
  actionUrl?: string | null;
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  function close() {
    setVisible(false);
    dismissPopupNotification(id);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-ink-800 p-6 text-center shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-900"
        >
          ✕
        </button>

        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand-light">
          <BellIcon className="h-7 w-7" />
        </span>

        <p className="mt-4 text-sm leading-relaxed">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          {actionUrl && actionLabel && (
            <a href={actionUrl} target="_blank" rel="noreferrer" className="btn-primary">
              {actionLabel}
            </a>
          )}
          <button type="button" onClick={close} className="btn-ghost">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1 1 12 0c0 3.5 1 5.5 2 7H4c1-1.5 2-3.5 2-7Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
