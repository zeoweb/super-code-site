"use client";

import { useState } from "react";
import { checkQuizAnswer, submitQuizAttempt } from "@/app/actions/quiz";
import type { QuizDifficulty } from "@prisma/client";

type Question = { id: string; text: string; options: string[] };

// Викторина проходится по одному вопросу за раз (не все сразу на одной
// странице): выбрал ответ → мгновенная подсказка верно/неверно → "Далее".
// Итоговый счёт всё равно пересчитывается на сервере при завершении.
export function QuizWizard({
  quizId,
  difficulty,
  questions,
}: {
  quizId: string;
  difficulty: QuizDifficulty;
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<{ correct: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const current = questions[index];
  const isLast = index === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  async function handleCheck() {
    if (selected === null || checking) return;
    setChecking(true);
    const result = await checkQuizAnswer(current.id, selected);
    setChecked(result);
    setAnswers((prev) => ({ ...prev, [current.id]: selected }));
    setChecking(false);
  }

  async function handleNext() {
    if (isLast) {
      setSubmitting(true);
      await submitQuizAttempt(quizId, difficulty, answers);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          Вопрос {index + 1} из {questions.length}
        </span>
        <span>{answeredCount} отвечено</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/80">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all duration-500"
          style={{ width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-medium">{current.text}</h2>

        <div className="mt-4 space-y-2">
          {current.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const showResult = checked !== null;
            const isCorrectOption = showResult && checked.correct && isSelected;
            const isWrongSelected = showResult && !checked.correct && isSelected;

            return (
              <button
                key={oi}
                type="button"
                disabled={showResult}
                onClick={() => setSelected(oi)}
                className={
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors duration-300 disabled:cursor-default " +
                  (isCorrectOption
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : isWrongSelected
                      ? "border-red-500/50 bg-red-500/10 text-red-300"
                      : isSelected
                        ? "border-brand/40 bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-brand/40")
                }
              >
                {opt}
              </button>
            );
          })}
        </div>

        {checked && (
          <p className={"mt-3 text-sm " + (checked.correct ? "text-emerald-400" : "text-red-400")}>
            {checked.correct ? "✓ Верно!" : "✗ Неверно."}
          </p>
        )}

        <div className="mt-5">
          {checked === null ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={selected === null || checking}
              className="btn-primary w-full disabled:opacity-40"
            >
              {checking ? "Проверяем…" : "Ответить"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-40"
            >
              {submitting ? "Завершаем…" : isLast ? "Завершить викторину" : "Далее →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
