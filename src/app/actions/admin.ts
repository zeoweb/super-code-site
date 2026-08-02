"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { saveUploadedLogo } from "@/lib/storage";
import type { TaskStatus } from "@prisma/client";

// ============================================================
//  Экшены админки. Каждый начинается с requireAdmin().
// ============================================================

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
  revalidatePath("/topup");
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
