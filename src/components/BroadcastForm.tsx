"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { sendBroadcast, type BroadcastState } from "@/app/actions/broadcast";
import { SubmitButton } from "@/components/SubmitButton";

type AudienceOption = { value: string; label: string; count: number };

export function BroadcastForm({ audiences }: { audiences: AudienceOption[] }) {
  const [state, action] = useFormState<BroadcastState, FormData>(sendBroadcast, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<FormData | null>(null);
  const [audience, setAudience] = useState("all");

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  const selected = audiences.find((a) => a.value === audience);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirmOpen) return;
    setPendingSubmit(new FormData(e.currentTarget));
    setConfirmOpen(true);
  }

  function confirmSend() {
    if (pendingSubmit) action(pendingSubmit);
    setConfirmOpen(false);
  }

  return (
    <>
      <form ref={formRef} onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="label">Кому отправить</label>
          <select
            name="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="input"
          >
            {audiences.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} ({a.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Текст сообщения</label>
          <textarea
            name="text"
            required
            rows={5}
            placeholder="Например: новый урок уже доступен! Смотрите тут: https://..."
            className="input resize-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Ссылки в тексте автоматически становятся кнопкой. Сообщение придёт каждому получателю в чат с куратором.
          </p>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
        )}
        {state?.ok && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            Отправлено {state.count} {declineRecipients(state.count ?? 0)}
          </p>
        )}

        <SubmitButton pendingText="Отправляем…">Отправить рассылку</SubmitButton>
      </form>

      {confirmOpen && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800/95 p-6 shadow-glow-lg backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Отправить рассылку?</h2>
            <p className="mt-2 text-sm text-slate-400">
              Сообщение получат <strong className="text-white">{selected.count}</strong> {declineRecipients(selected.count)} —
              сегмент «{selected.label}». Это действие нельзя отменить.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setConfirmOpen(false)} className="btn-ghost flex-1">
                Отмена
              </button>
              <button type="button" onClick={confirmSend} className="btn-primary flex-1">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function declineRecipients(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "ученику";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "ученикам";
  return "ученикам";
}
