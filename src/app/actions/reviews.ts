"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

export type ReviewState = { error?: string; ok?: boolean } | undefined;

// Отзыв от залогиненного пользователя (форма на /about).
export async function createReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Войдите, чтобы оставить отзыв" };

  const text = String(formData.get("text") ?? "").trim();
  const rating = Number(formData.get("rating"));
  if (!text) return { error: "Напишите текст отзыва" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Выберите оценку" };

  await prisma.review.create({
    data: { userId: user.id, name: user.name, text, rating },
  });

  revalidatePath("/about");
  return { ok: true };
}

// Отзыв, добавленный админом вручную (перенос из другого источника) — без userId.
export async function createReviewAdmin(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  const ratingRaw = String(formData.get("rating") ?? "").trim();
  if (!name || !text) return;

  const rating = ratingRaw ? Number(ratingRaw) : null;

  await prisma.review.create({
    data: {
      name,
      text,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
    },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/about");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/about");
}
