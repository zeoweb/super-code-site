"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

// Простой чат "ученик ↔ поддержка". Один линейный тред сообщений на ученика.

// --- Ученик пишет в поддержку ---
export async function sendStudentMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  await prisma.chatMessage.create({
    data: { userId: user.id, fromAdmin: false, text },
  });

  revalidatePath("/support");
  revalidatePath("/admin/chats");
  revalidatePath(`/admin/chats/${user.id}`);
}

// --- Админ отвечает конкретному ученику ---
export async function sendAdminReply(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const text = String(formData.get("text") ?? "").trim();
  if (!userId || !text) return;

  await prisma.chatMessage.create({
    data: { userId, fromAdmin: true, text },
  });

  revalidatePath(`/admin/chats/${userId}`);
  revalidatePath("/admin/chats");
  revalidatePath("/support");
}

// Отмечает ответы куратора прочитанными (вызывается при открытии чата в модалке).
export async function markCuratorMessagesRead() {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.chatMessage.updateMany({
    where: { userId: user.id, fromAdmin: true, read: false },
    data: { read: true },
  });
}
