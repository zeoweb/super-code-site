"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import type { Tier } from "@prisma/client";

// Массовая рассылка: доставляется как обычные ChatMessage (fromAdmin: true) —
// та же лента, что и ответы куратора, включая рендер ссылок кнопкой и бейдж
// непрочитанного в колокольчике. Broadcast — только лог отправленной кампании.

export type BroadcastState = { error?: string; ok?: boolean; count?: number } | undefined;

export async function sendBroadcast(
  _prev: BroadcastState,
  formData: FormData,
): Promise<BroadcastState> {
  await requireAdmin();

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "Введите текст рассылки" };

  const audienceRaw = String(formData.get("audience") ?? "all");
  const audience: Tier | null = audienceRaw === "all" ? null : (audienceRaw as Tier);

  const recipients = await prisma.user.findMany({
    where: { role: "student", ...(audience ? { tier: audience } : {}) },
    select: { id: true },
  });
  if (recipients.length === 0) {
    return { error: "В выбранном сегменте нет ни одного ученика" };
  }

  await prisma.$transaction([
    prisma.chatMessage.createMany({
      data: recipients.map((r) => ({ userId: r.id, fromAdmin: true, text })),
    }),
    prisma.broadcast.create({
      data: { text, audience, recipientCount: recipients.length },
    }),
  ]);

  revalidatePath("/admin/broadcast");
  revalidatePath("/admin/chats");
  revalidatePath("/support");
  return { ok: true, count: recipients.length };
}
