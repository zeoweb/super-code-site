"use server";

import { validateGameId, type ValidateIdResult } from "@/lib/fazercards";

// Проверка игрового ID кнопкой "Проверить" на странице покупки — вызывается
// напрямую из клиента (без формы/редиректа), ключ FazerCards остаётся на
// сервере. Ничего не списывает и не создаёт Order.
export async function checkGameId(gameSlug: string, playerId: string): Promise<ValidateIdResult> {
  const trimmed = playerId.trim();
  if (!trimmed) return { status: "invalid" };
  return validateGameId(gameSlug, trimmed);
}
