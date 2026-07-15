import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessQuizDifficulty, quizDifficultyLabel } from "@/lib/access";
import { QUIZ_XP } from "@/lib/gamification";
import type { QuizDifficulty } from "@prisma/client";

const LEVELS: { difficulty: QuizDifficulty; hint: string }[] = [
  { difficulty: "novice", hint: "Основы: что такое сайт, Git, API, домен, ИИ-инструменты." },
  { difficulty: "medium", hint: "Синтаксис, команды Git, HTTP, SQL, Telegram Bot API." },
  { difficulty: "pro", hint: "Алгоритмы, БД, безопасность, деплой, продвинутые боты." },
];

// Викторина: выбор уровня сложности. Новичок — бесплатно всем,
// Средний и Про — требуют тариф Plus+ (после покупки открываются оба сразу).
export default async function QuizPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/quiz");

  const quiz = await prisma.quiz.findFirst();
  if (!quiz) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-sm text-slate-500">Викторина скоро появится — загляните позже.</p>
      </main>
    );
  }

  const [counts, bestAttempts] = await Promise.all([
    prisma.quizQuestion.groupBy({
      by: ["difficulty"],
      where: { quizId: quiz.id },
      _count: { _all: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id, quizId: quiz.id },
      orderBy: { score: "desc" },
    }),
  ]);
  const countByDifficulty = Object.fromEntries(counts.map((c) => [c.difficulty, c._count._all]));
  const bestByDifficulty = new Map<QuizDifficulty, (typeof bestAttempts)[number]>();
  for (const a of bestAttempts) {
    if (!bestByDifficulty.has(a.difficulty)) bestByDifficulty.set(a.difficulty, a);
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <span className="badge border-brand/40 text-brand-light">Проверь себя</span>
      <h1 className="mt-2 text-2xl font-bold">Викторина</h1>
      <p className="mt-1 text-slate-400">
        Выберите уровень сложности — каждый раз новая случайная подборка вопросов.
      </p>

      <div className="mt-6 space-y-4">
        {LEVELS.map((lvl) => {
          const total = countByDifficulty[lvl.difficulty] ?? 0;
          const best = bestByDifficulty.get(lvl.difficulty);
          const allowed = canAccessQuizDifficulty(user.tier, lvl.difficulty);

          return (
            <div key={lvl.difficulty} className="card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{quizDifficultyLabel(lvl.difficulty)}</h2>
                {!allowed && <span className="badge border-brand/40 text-brand-light">🔒 Plus+</span>}
              </div>
              <p className="mt-1 text-sm text-slate-400">{lvl.hint}</p>
              <p className="mt-2 text-xs text-slate-500">
                {total} вопросов в банке · до 10 случайных за попытку · +{QUIZ_XP} XP за первое прохождение
              </p>

              {best && (
                <p className="mt-2 text-sm text-brand-light">
                  Ваш лучший результат: {best.score} из {best.total}
                </p>
              )}

              <div className="mt-4">
                {total === 0 ? (
                  <span className="badge text-slate-500">Скоро</span>
                ) : allowed ? (
                  <Link href={`/quiz/play?difficulty=${lvl.difficulty}`} className="btn-primary">
                    {best ? "Пройти ещё раз" : "Пройти викторину"}
                  </Link>
                ) : (
                  <Link href="/billing" className="btn-ghost">
                    Открыть на Plus+
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/leaderboard" className="btn-ghost mt-4 inline-flex w-full justify-center">
        Смотреть рейтинг
      </Link>
    </main>
  );
}
