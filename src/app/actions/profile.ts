"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { nameSchema } from "@/lib/validation";
import { saveUploadedAvatar } from "@/lib/storage";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";
export type PasswordState = { error?: string; field?: PasswordField; ok?: boolean } | undefined;

// Обновление имени пользователя из профиля (инлайн-редактирование).
export async function updateProfileName(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте имя" };
  }
  const name = parsed.data.trim();

  await prisma.user.update({ where: { id: user.id }, data: { name } });
  // Обновляем сессию, чтобы новое имя сразу отобразилось в хедере.
  await createSession({ sub: user.id, role: user.role, name });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/billing");
  return { ok: true };
}

// Смена пароля из профиля: требует текущий пароль, новый — минимум 8 символов.
export async function updateProfilePassword(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "Новый пароль минимум 8 символов", field: "newPassword" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Пароли не совпадают", field: "confirmPassword" };
  }

  const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { error: "Текущий пароль неверный", field: "currentPassword" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return { ok: true };
}

// Загрузка/смена аватарки — видна везде: в рейтинге, чатах, сайдбарах.
export async function updateAvatar(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Требуется вход" };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Выберите изображение" };
  }

  let avatarUrl: string;
  try {
    avatarUrl = await saveUploadedAvatar(file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка загрузки файла" };
  }

  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/community");
  revalidatePath("/admin", "layout");

  return { ok: true };
}
