import { z } from "zod";

// Простая эвристика: если во введённой строке есть «@» — считаем это email,
// иначе — телефон. Так пользователь может входить любым из двух значений.
export function looksLikeEmail(value: string): boolean {
  return value.includes("@");
}

// Нормализуем телефон: оставляем ведущий + и цифры.
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export const registerSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое").max(80),
  email: z
    .string()
    .email("Некорректный email")
    .transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .min(7, "Некорректный телефон")
    .transform(normalizePhone),
  password: z.string().min(8, "Пароль минимум 8 символов").max(100),
});

export const nameSchema = z.string().min(2, "Имя слишком короткое").max(80, "Имя слишком длинное");

export const loginSchema = z.object({
  // Может быть email ИЛИ телефон — определяем на бэкенде.
  identifier: z.string().min(3, "Введите email или телефон"),
  password: z.string().min(1, "Введите пароль"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
