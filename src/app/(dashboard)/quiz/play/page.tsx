import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessQuizDifficulty, quizDifficultyLabel } from "@/lib/access";
import { QuizWizard } from "@/components/QuizWizard";
import type { QuizDifficulty } from "@prisma/client";

const QUESTIONS_PER_ATTEMPT = 10;
const VALID_DIFFICULTIES: QuizDifficulty[] = ["novice", "medium", "pro"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Викторина проходится по одному вопросу за раз (QuizWizard). Правильные
// ответы (correctIndex) на клиент не передаются — только id/текст/варианты.
export default async function QuizPlayPage({
  searchParams,
}: {
  searchParams: { difficulty?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/quiz/play");

  const difficulty = searchParams.difficulty as QuizDifficulty;
  if (!VALID_DIFFICULTIES.includes(difficulty)) redirect("/quiz");
  if (!canAccessQuizDifficulty(user.tier, difficulty)) redirect("/quiz");

  const quiz = await prisma.quiz.findFirst();
  if (!quiz) redirect("/quiz");

  const pool = await prisma.quizQuestion.findMany({
    where: { quizId: quiz.id, difficulty },
    select: { id: true, text: true, options: true },
  });
  if (pool.length === 0) redirect("/quiz");

  const questions = shuffle(pool).slice(0, QUESTIONS_PER_ATTEMPT);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/quiz" className="text-sm text-slate-400 hover:text-white">← К викторине</Link>

      <h1 className="mt-3 text-2xl font-bold">
        Викторина · {quizDifficultyLabel(difficulty)}
      </h1>
      <p className="mt-1 text-slate-400">Выбирайте один вариант ответа на каждый вопрос.</p>

      <div className="mt-6">
        <QuizWizard quizId={quiz.id} difficulty={difficulty} questions={questions} />
      </div>
    </main>
  );
}
