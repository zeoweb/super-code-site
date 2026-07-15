"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  looksLikeEmail,
  normalizePhone,
} from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

// --- Регистрация ---
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте данные" };
  }
  const { name, email, phone, password } = parsed.data;

  // Проверка уникальности email и телефона
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    select: { email: true, phone: true },
  });
  if (existing) {
    if (existing.email === email) return { error: "Такой email уже зарегистрирован" };
    return { error: "Такой телефон уже зарегистрирован" };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    },
  });

  await createSession({ sub: user.id, role: user.role, name: user.name });

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard");
}

// --- Вход по email ИЛИ телефону ---
export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте данные" };
  }
  const { identifier, password } = parsed.data;

  // Определяем, email это или телефон, и ищем по нужному полю.
  const where = looksLikeEmail(identifier)
    ? { email: identifier.trim().toLowerCase() }
    : { phone: normalizePhone(identifier) };

  const user = await prisma.user.findFirst({ where });
  // Одинаковое сообщение об ошибке, чтобы не раскрывать, что именно неверно.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Неверный логин или пароль" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({ sub: user.id, role: user.role, name: user.name });

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard");
}

// --- Выход ---
export async function logoutAction(): Promise<void> {
  destroySession();
  redirect("/");
}
