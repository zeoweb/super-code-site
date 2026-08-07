import "server-only";

// Клиент FazerCards API — используется только на сервере (ключ не должен
// попасть в браузер). Используется для (1) проверки игрового ID перед
// покупкой и (2) авто-заказа для Free Fire (CIS), см. lib/fazerAutoOrder.ts.
const BASE = process.env.FAZERCARDS_API_BASE ?? "https://api.fzr.cards";

// category_id из FazerCards ("free_fire") не привязан к региону — региона
// сама API определяет по player_id. Список специально ограничен одной
// игрой — остальные пока проверяются по-старому (см. ТЗ).
const VALIDATE_CATEGORY_BY_GAME_SLUG: Record<string, string> = {
  "free-fire-cis": "free_fire",
};

export function supportsIdValidation(gameSlug: string): boolean {
  return gameSlug in VALIDATE_CATEGORY_BY_GAME_SLUG;
}

// Регионы, которые FazerCards считает СНГ для Free Fire — сейчас видели
// только "RU" (единственный подтверждённый вживую код для категории
// free_fire_cis). Если в будущем всплывут другие коды (KZ, BY и т.п.) —
// добавить сюда.
export const FREE_FIRE_CIS_REGIONS = ["RU"];

export type ValidateIdResult =
  | { status: "valid"; playerName: string | null; region: string | null }
  | { status: "invalid" }
  | { status: "unavailable" };

async function fazerFetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
  const apiKey = process.env.FAZERCARDS_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json", ...(init.headers ?? {}) },
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function validateGameId(gameSlug: string, playerId: string): Promise<ValidateIdResult> {
  const categoryId = VALIDATE_CATEGORY_BY_GAME_SLUG[gameSlug];
  if (!categoryId) return { status: "unavailable" };

  const res = await fazerFetch(
    "/api/v2/topups/validate-id",
    { method: "POST", body: JSON.stringify({ category_id: categoryId, fields: { player_id: playerId } }) },
    8000,
  );
  if (!res) return { status: "unavailable" };

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    // 422 — ID не подтверждён FazerCards, 400 — некорректный ввод: оба
    // читаем как "невалидный ID". Всё остальное (5xx, сеть, таймаут) —
    // "проверка недоступна", не блокирует покупку.
    if (res.status === 422 || res.status === 400) return { status: "invalid" };
    return { status: "unavailable" };
  }
  if (!json.valid) return { status: "invalid" };
  return { status: "valid", playerName: json.player_name ?? null, region: json.region ?? null };
}

export type FazerBalanceResult = { ok: true; balanceUsd: number } | { ok: false };

export async function getFazerCardsBalance(): Promise<FazerBalanceResult> {
  const res = await fazerFetch("/api/v2/balance", { method: "GET" }, 5000);
  if (!res || !res.ok) return { ok: false };
  const json = await res.json().catch(() => null);
  if (!json?.ok) return { ok: false };
  const balanceUsd = parseFloat(json.balance);
  if (!Number.isFinite(balanceUsd)) return { ok: false };
  return { ok: true, balanceUsd };
}

export type FazerOfferPriceResult = { ok: true; priceUsd: number } | { ok: false };

export async function getFazerCardsOfferPrice(categoryId: string, offerId: string): Promise<FazerOfferPriceResult> {
  const res = await fazerFetch(`/api/v2/topups/offers?category_id=${encodeURIComponent(categoryId)}`, { method: "GET" }, 5000);
  if (!res || !res.ok) return { ok: false };
  const json = await res.json().catch(() => null);
  if (!json?.ok) return { ok: false };
  const offer = (json.offers ?? []).find((o: { offer_id: string | null }) => o.offer_id === offerId);
  if (!offer) return { ok: false };
  const priceUsd = parseFloat(offer.price_usd);
  if (!Number.isFinite(priceUsd)) return { ok: false };
  return { ok: true, priceUsd };
}

export type FazerOrderStatusResult =
  | { ok: true; status: string; failReason: string | null }
  | { ok: false };

// Статус заказа для поллинга (см. api/cron/fazer-poll) — тот же
// GET /api/v2/orders/{orderId}, что использовался при ручной проверке.
export async function getFazerCardsOrderStatus(externalOrderId: string): Promise<FazerOrderStatusResult> {
  const res = await fazerFetch(`/api/v2/orders/${encodeURIComponent(externalOrderId)}`, { method: "GET" }, 8000);
  if (!res || !res.ok) return { ok: false };
  const json = await res.json().catch(() => null);
  if (!json?.ok || !json.order?.status) return { ok: false };
  return { ok: true, status: json.order.status, failReason: json.order.fail_reason ?? null };
}

export type FazerCreateOrderResult =
  | { ok: true; externalOrderId: string; externalStatus: string }
  | { ok: false; reason: string };

export async function createFazerCardsOrder(
  categoryId: string,
  offerId: string,
  fields: Record<string, string>,
  idempotencyKey: string,
): Promise<FazerCreateOrderResult> {
  const res = await fazerFetch(
    "/api/v2/topups/order",
    {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ category_id: categoryId, offer_id: offerId, fields }),
    },
    8000,
  );
  if (!res) return { ok: false, reason: "Нет ответа от FazerCards (таймаут/сеть)" };

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok || !json.order?.id) {
    return { ok: false, reason: json?.error ?? `FazerCards вернул ошибку (HTTP ${res.status})` };
  }
  return { ok: true, externalOrderId: json.order.id, externalStatus: json.order.status ?? "created" };
}
