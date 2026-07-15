"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function renameAiConversation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 60);
  if (!id || !title) return;

  await prisma.aiConversation.updateMany({ where: { id, userId: user.id }, data: { title } });
  revalidatePath("/ai");
}

export async function deleteAiConversation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.aiConversation.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/ai");
}
