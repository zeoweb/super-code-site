import "server-only";

// Клиент FazerCards API — используется только на сервере (ключ не должен
// попасть в браузер). Пока единственное применение — проверка игрового ID
// перед покупкой (см. actions/gameId.ts), сама покупка через этот API не
// оформляется.
const BASE = process.env.FAZERCARDS_API_BASE ?? "https://api.fzr.cards";
const VALIDATE_TIMEOUT_MS = 8000;

// category_id из FazerCards ("free_fire") не привязан к региону — региона
// сама API определяет по player_id. Список специально ограничен одной
// игрой — остальные пока проверяются по-старому (см. ТЗ).
const VALIDATE_CATEGORY_BY_GAME_SLUG: Record<string, string> = {
  "free-fire-cis": "free_fire",
};

export function supportsIdValidation(gameSlug: string): boolean {
  return gameSlug in VALIDATE_CATEGORY_BY_GAME_SLUG;
}

export type ValidateIdResult =
  | { status: "valid"; playerName: string | null }
  | { status: "invalid" }
  | { status: "unavailable" };

export async function validateGameId(gameSlug: string, playerId: string): Promise<ValidateIdResult> {
  const categoryId = VALIDATE_CATEGORY_BY_GAME_SLUG[gameSlug];
  const apiKey = process.env.FAZERCARDS_API_KEY;
  if (!categoryId || !apiKey) return { status: "unavailable" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VALIDATE_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}/api/v2/topups/validate-id`, {
      method: "POST",
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: categoryId, fields: { player_id: playerId } }),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      // 422 — ID не подтверждён FazerCards, 400 — некорректный ввод: оба
      // читаем как "невалидный ID". Всё остальное (5xx, сеть, таймаут) —
      // "проверка недоступна", не блокирует покупку.
      if (res.status === 422 || res.status === 400) return { status: "invalid" };
      return { status: "unavailable" };
    }
    if (!json.valid) return { status: "invalid" };
    return { status: "valid", playerName: json.player_name ?? null };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}
