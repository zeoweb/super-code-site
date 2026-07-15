"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";
import { canAccessQuizDifficulty } from "@/lib/access";
import { QUIZ_XP } from "@/lib/gamification";
import type { QuizDifficulty } from "@prisma/client";

// Мгновенная проверка одного ответа (для пошагового прохождения — вопрос за
// вопросом). Финальный счёт всё равно пересчитывается на сервере в
// submitQuizAttempt, так что доверять клиентскому состоянию не нужно.
export async function checkQuizAnswer(
  questionId: string,
  selectedIndex: number,
): Promise<{ correct: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { correct: false };

  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { correctIndex: true },
  });
  if (!question) return { correct: false };

  return { correct: question.correctIndex === selectedIndex };
}

// Ученик завершает викторину. Финальный счёт считается на сервере по всем
// answers сразу — клиентские "мгновенные" результаты из checkQuizAnswer
// используются только для UX, а не как источник правды.
export async function submitQuizAttempt(
  quizId: string,
  difficulty: QuizDifficulty,
  answers: Record<string, number>,
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/quiz");

  if (!canAccessQuizDifficulty(user.tier, difficulty)) redirect("/quiz");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { where: { id: { in: Object.keys(answers) } } } },
  });
  if (!quiz) redirect("/quiz");

  let score = 0;
  for (const q of quiz.questions) {
    if (answers[q.id] === q.correctIndex) score++;
  }
  const total = quiz.questions.length;

  // XP начисляется один раз за уровень сложности — проверяем, была ли уже
  // успешная попытка именно на этом уровне.
  const alreadyAwarded = await prisma.quizAttempt.findFirst({
    where: { userId: user.id, quizId, difficulty, xpAwarded: true },
  });
  const shouldAwardXp = !alreadyAwarded;

  await prisma.quizAttempt.create({
    data: { userId: user.id, quizId, difficulty, score, total, xpAwarded: shouldAwardXp },
  });

  if (shouldAwardXp) {
    await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: QUIZ_XP } } });
    const levelLabel = { novice: "Новичок", medium: "Средний", pro: "Про" }[difficulty];
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Поздравляем! Вы прошли викторину (уровень ${levelLabel}) — ${score} из ${total} правильных 🎉`,
      },
    });
  }

  revalidatePath("/quiz");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  redirect(
    `/quiz/result?score=${score}&total=${total}&difficulty=${difficulty}&awarded=${shouldAwardXp ? "1" : "0"}`,
  );
}

// --- Админка: управление вопросами викторины ---
export async function createQuizQuestion(formData: FormData) {
  await requireAdmin();
  const quizId = String(formData.get("quizId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  const options = [1, 2, 3, 4]
    .map((i) => String(formData.get(`option${i}`) ?? "").trim())
    .filter(Boolean);
  const correctIndex = Number(formData.get("correctIndex") ?? 0);
  const difficulty = String(formData.get("difficulty") ?? "novice") as QuizDifficulty;
  if (!text || options.length < 2) return;

  const count = await prisma.quizQuestion.count({ where: { quizId, difficulty } });
  await prisma.quizQuestion.create({
    data: { quizId, text, options, correctIndex, difficulty, orderIndex: count },
  });
  revalidatePath("/admin/quiz");
}

export async function deleteQuizQuestion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath("/admin/quiz");
}
