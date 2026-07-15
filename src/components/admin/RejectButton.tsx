"use client";

import { useState } from "react";
import { rejectPayment } from "@/app/actions/admin";

// Кнопка «Отклонить» → раскрывает поле для обязательного комментария.
export function RejectButton({ paymentId }: { paymentId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost px-3 py-2 text-sm text-red-400">
        Отклонить
      </button>
    );
  }

  return (
    <form action={rejectPayment} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={paymentId} />
      <input
        name="comment"
        required
        placeholder="Причина отклонения"
        className="input py-2 text-sm"
      />
      <button className="btn-primary px-3 py-2 text-sm">Подтвердить</button>
    </form>
  );
}
