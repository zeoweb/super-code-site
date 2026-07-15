"use client";

import { useState, useTransition } from "react";
import { toggleLessonComplete } from "@/app/actions/progress";

// Кнопка «Отметить пройденным» с оптимистичным состоянием.
export function CompleteButton({
  lessonId,
  initialCompleted,
}: {
  lessonId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const next = !completed;
    setCompleted(next); // оптимистично
    startTransition(async () => {
      const res = await toggleLessonComplete(lessonId, next);
      if (res?.error) setCompleted(!next); // откат при ошибке
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={completed ? "btn-ghost" : "btn-primary"}
    >
      {completed ? "✓ Пройдено — снять отметку" : "Отметить пройденным"}
    </button>
  );
}
