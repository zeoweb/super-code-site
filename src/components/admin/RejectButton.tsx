"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

// Кнопка «Отклонить» → раскрывает поле для обязательного комментария.
export function RejectButton({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost px-3 py-2 text-sm text-red-600">
        Отклонить
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={id} />
      <input
        name="comment"
        required
        placeholder="Причина отклонения"
        className="input py-2 text-sm"
      />
      <SubmitButton className="btn-primary px-3 py-2 text-sm" pendingText="Отправляем…">
        Подтвердить
      </SubmitButton>
    </form>
  );
}
