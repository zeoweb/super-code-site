"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendStudentMessage } from "@/app/actions/chat";

// Форма отправки сообщения куратору на странице /support. Экшен может
// вернуть {error} (например, если сессия истекла) — form action={fn} такое
// не поддерживает, поэтому вызываем экшен из клиентского обработчика.
export function SupportMessageForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await sendStudentMessage(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          name="text"
          className="input flex-1"
          placeholder="Ваше сообщение…"
          required
          disabled={pending}
        />
        <button type="submit" className="btn-primary px-5" disabled={pending}>
          {pending ? "Отправка…" : "Отправить"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </form>
  );
}
