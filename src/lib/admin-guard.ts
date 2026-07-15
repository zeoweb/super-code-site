import "server-only";
import { getCurrentUser } from "@/lib/auth";

// Проверка, что текущий пользователь — админ. Бросает, если нет.
// Используется в серверных экшенах админки как второй рубеж защиты
// (первый — middleware по пути /admin).
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Доступ только для администратора");
  }
  return user;
}
