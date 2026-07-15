"use client";

import { useFormStatus } from "react-dom";

// Кнопка отправки формы, которая сама показывает состояние загрузки.
export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingText = "Секунду…",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
