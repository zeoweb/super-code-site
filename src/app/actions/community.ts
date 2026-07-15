"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessCommunityChat } from "@/lib/access";
import { saveCommunityMedia } from "@/lib/storage";

// Чат участников (Pro): текст и/или вложение (фото/видео). Вызывается
// напрямую из клиента (не через <form>), поэтому возвращает { error }
// вместо редиректа — так UI может показать ошибку, не покидая страницу.
export async function sendCommunityMessage(formData: FormData): Promise<{ error?: string } | void> {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };
  if (!canAccessCommunityChat(user.tier, user.role === "admin")) {
    return { error: "Доступно только на тарифе Pro" };
  }

  const text = String(formData.get("text") ?? "").trim();
  const file = formData.get("media");

  let mediaUrl: string | undefined;
  let mediaType: "image" | "video" | undefined;

  if (file instanceof File && file.size > 0) {
    try {
      const saved = await saveCommunityMedia(file);
      mediaUrl = saved.url;
      mediaType = saved.type;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Ошибка загрузки файла" };
    }
  }

  if (!text && !mediaUrl) {
    return { error: "Введите сообщение или прикрепите фото/видео" };
  }

  await prisma.communityMessage.create({
    data: { userId: user.id, text: text || null, mediaUrl, mediaType },
  });

  revalidatePath("/community");
}
