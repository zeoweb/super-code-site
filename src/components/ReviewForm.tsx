"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { createReview, type ReviewState } from "@/app/actions/reviews";
import { StarRatingInput } from "@/components/StarRating";
import { SubmitButton } from "@/components/SubmitButton";

// Форма отзыва для залогиненного пользователя. После успешной отправки —
// короткий тост "Спасибо за отзыв!", без пересчёта списка/рейтинга на странице.
export function ReviewForm() {
  const [state, action] = useFormState<ReviewState, FormData>(createReview, undefined);
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.ok) return;
    setToast("Спасибо за отзыв!");
    formRef.current?.reset();
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="card space-y-3">
      <h3 className="font-semibold">Оставить отзыв</h3>
      <StarRatingInput />
      <textarea
        name="text"
        required
        rows={3}
        className="input resize-none"
        placeholder="Расскажите, как вам сервис…"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {toast && (
        <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
          ✓ {toast}
        </p>
      )}
      <SubmitButton className="btn-primary" pendingText="Отправляем…">
        Отправить отзыв
      </SubmitButton>
    </form>
  );
}
