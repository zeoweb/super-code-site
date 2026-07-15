"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { createBunnyVideo } from "@/lib/bunny";
import { saveUploadedVideo, saveUploadedLogo } from "@/lib/storage";
import type { Tier, RequiredTier, TaskStatus } from "@prisma/client";

// ============================================================
//  Экшены админки. Каждый начинается с requireAdmin().
// ============================================================

// Закрытый Telegram-канал с видеоуроками и готовыми кодами ботов/сайтов
// уровня Pro — ссылку отправляем в чат с куратором сразу после одобрения оплаты.
const PRO_CHANNEL_URL = "https://telegram.me/+3lx47piRYyw0ZjNi";
const PRO_CHANNEL_MESSAGE =
  "🎉 Поздравляем с тарифом Pro!\n\n" +
  "Все видеоуроки, а также готовые коды Telegram-ботов и сайтов уровня Pro находятся в закрытом Telegram-канале — вот ссылка:\n" +
  PRO_CHANNEL_URL;

// --- Платежи ---
export async function approvePayment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) return;

  // Транзакция: обновляем статус заявки и тариф пользователя.
  await prisma.$transaction([
    prisma.payment.update({
      where: { id },
      data: { status: "approved", reviewedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: payment.userId },
      data: { tier: payment.tier },
    }),
  ]);

  // Тариф Pro — отправляем ссылку на закрытый канал сообщением от куратора.
  if (payment.tier === "pro") {
    await prisma.chatMessage.create({
      data: { userId: payment.userId, fromAdmin: true, text: PRO_CHANNEL_MESSAGE },
    });
    revalidatePath("/support");
    revalidatePath(`/admin/chats/${payment.userId}`);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/users");
}

export async function rejectPayment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return; // причина обязательна (поле required на клиенте)

  await prisma.payment.update({
    where: { id },
    data: { status: "rejected", adminComment: comment, reviewedAt: new Date() },
  });
  revalidatePath("/admin/payments");
}

// --- Способы оплаты ---
export async function savePaymentMethod(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data: {
    bankName: string;
    phoneNumber: string;
    recipientName: string;
    isActive: boolean;
    logoUrl?: string;
  } = {
    bankName: String(formData.get("bankName") ?? "").trim(),
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
    recipientName: String(formData.get("recipientName") ?? "").trim(),
    isActive: formData.get("isActive") === "on",
  };
  if (!data.bankName || !data.phoneNumber) return;

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      data.logoUrl = await saveUploadedLogo(logo);
    } catch (e) {
      console.error("Logo upload failed:", e instanceof Error ? e.message : e);
    }
  }

  if (id) {
    await prisma.paymentMethod.update({ where: { id }, data });
  } else {
    await prisma.paymentMethod.create({ data });
  }
  revalidatePath("/admin/methods");
  revalidatePath("/billing/checkout/method");
}

export async function togglePaymentMethod(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const method = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!method) return;
  await prisma.paymentMethod.update({
    where: { id },
    data: { isActive: !method.isActive },
  });
  revalidatePath("/admin/methods");
}

// --- Пользователи ---
export async function setUserTier(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const tier = String(formData.get("tier")) as Tier;
  if (!["none", "plus", "pro"].includes(tier)) return;
  await prisma.user.update({ where: { id }, data: { tier } });
  revalidatePath("/admin/users");
}

// --- Модули ---
export async function createModule(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({
    data: { courseId, title, orderIndex: count },
  });
  revalidatePath("/admin/lessons");
}

export async function deleteModule(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.module.delete({ where: { id } });
  revalidatePath("/admin/lessons");
}

// --- Уроки ---
export async function createLesson(formData: FormData) {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: { moduleId, title, orderIndex: count, requiredTier: "free", isFree: true },
  });
  revalidatePath("/admin/lessons");
}

export async function updateLesson(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const requiredTier = String(formData.get("requiredTier")) as RequiredTier;

  await prisma.lesson.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      bunnyVideoId: String(formData.get("bunnyVideoId") ?? "").trim() || null,
      durationSeconds: Number(formData.get("durationSeconds") ?? 0) || 0,
      orderIndex: Number(formData.get("orderIndex") ?? 0) || 0,
      isFree: formData.get("isFree") === "on",
      requiredTier: ["free", "plus", "pro"].includes(requiredTier) ? requiredTier : "free",
    },
  });
  revalidatePath("/admin/lessons");
}

export async function deleteLesson(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/admin/lessons");
}

// Создать «пустое» видео в Bunny и привязать guid к уроку.
// Файл затем заливается в панели Bunny (или отдельным аплоадером).
export async function createBunnyVideoForLesson(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "Урок");
  const guid = await createBunnyVideo(title);
  if (!guid) return; // не удалось создать (проверьте BUNNY_* в .env)
  await prisma.lesson.update({ where: { id }, data: { bunnyVideoId: guid } });
  revalidatePath("/admin/lessons");
}

// --- Отзывы ---
export async function createReview(formData: FormData) {
  await requireAdmin();

  const studentName = String(formData.get("studentName") ?? "").trim();
  if (!studentName) return;

  const studentRole = String(formData.get("studentRole") ?? "").trim() || null;
  const quoteText = String(formData.get("quoteText") ?? "").trim() || null;
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5) || 5));
  const isPublished = formData.get("isPublished") === "on";

  const videoFile = formData.get("video");
  let videoUrl: string | null = null;
  if (videoFile instanceof File && videoFile.size > 0) {
    videoUrl = await saveUploadedVideo(videoFile);
  }

  const count = await prisma.review.count();
  await prisma.review.create({
    data: { studentName, studentRole, quoteText, videoUrl, rating, isPublished, orderIndex: count },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function updateReview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const studentName = String(formData.get("studentName") ?? "").trim();
  if (!studentName) return;

  const studentRole = String(formData.get("studentRole") ?? "").trim() || null;
  const quoteText = String(formData.get("quoteText") ?? "").trim() || null;
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5) || 5));
  const isPublished = formData.get("isPublished") === "on";
  const orderIndex = Number(formData.get("orderIndex") ?? 0) || 0;

  const videoFile = formData.get("video");
  const data: {
    studentName: string;
    studentRole: string | null;
    quoteText: string | null;
    rating: number;
    isPublished: boolean;
    orderIndex: number;
    videoUrl?: string;
  } = { studentName, studentRole, quoteText, rating, isPublished, orderIndex };

  if (videoFile instanceof File && videoFile.size > 0) {
    data.videoUrl = await saveUploadedVideo(videoFile);
  }

  await prisma.review.update({ where: { id }, data });

  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function toggleReviewPublish(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.update({ where: { id }, data: { isPublished: !review.isPublished } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

// --- Задачи ---
export async function createTask(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const description = String(formData.get("description") ?? "").trim() || null;
  await prisma.task.create({ data: { title, description } });
  revalidatePath("/admin/tasks");
}

export async function setTaskStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as TaskStatus;
  if (!["open", "in_progress", "done"].includes(status)) return;
  await prisma.task.update({
    where: { id },
    data: { status, completedAt: status === "done" ? new Date() : null },
  });
  revalidatePath("/admin/tasks");
}

export async function deleteTask(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.task.delete({ where: { id } });
  revalidatePath("/admin/tasks");
}

// --- Финансы ---
export async function createExpense(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(formData.get("amount"));
  if (!title || !amount || amount <= 0) return;
  const category = String(formData.get("category") ?? "").trim() || null;
  await prisma.expense.create({ data: { title, amount, category } });
  revalidatePath("/admin/finance");
}

export async function deleteExpense(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/admin/finance");
}
