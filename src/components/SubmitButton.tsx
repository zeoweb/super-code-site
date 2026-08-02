"use client";

import { useFormStatus } from "react-dom";

// Кнопка отправки формы, которая сама показывает состояние загрузки.
export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingText = "Секунду…",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
