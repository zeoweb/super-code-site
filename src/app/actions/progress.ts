"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessLesson } from "@/lib/access";
import { LESSON_XP } from "@/lib/gamification";
import { ordinalRu } from "@/lib/ordinal";

// Отметить урок пройденным / снять отметку.
export async function toggleLessonComplete(lessonId: string, completed: boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return { error: "Урок не найден" };

  // Нельзя отметить платный урок пройденным, если нет доступа.
  const allowed = canAccessLesson({
    userTier: user.tier,
    requiredTier: lesson.requiredTier,
    isFree: lesson.isFree,
    isAdmin: user.role === "admin",
  });
  if (!allowed) return { error: "Нет доступа к уроку" };

  // xpAwarded — разовый флаг, который никогда не сбрасывается: гарантирует,
  // что снятие и повторная отметка "пройдено" не начислят XP ещё раз.
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  const alreadyAwarded = existing?.xpAwarded ?? false;
  const shouldAwardXp = completed && !alreadyAwarded;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
      ...(shouldAwardXp ? { xpAwarded: true } : {}),
    },
    create: {
      userId: user.id,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
      xpAwarded: shouldAwardXp,
    },
  });

  if (shouldAwardXp) {
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: LESSON_XP } },
    });

    // Поздравительное уведомление: "второй", "третий" и т.д. — по количеству
    // уже пройденных уроков этого пользователя (а не по позиции в курсе).
    const completedCount = await prisma.lessonProgress.count({
      where: { userId: user.id, completed: true },
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        message: `Поздравляем! Вы прошли ${ordinalRu(completedCount)} урок 🎉`,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath("/leaderboard");
  revalidatePath("/profile");
  return { ok: true };
}
