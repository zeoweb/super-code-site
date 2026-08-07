import "server-only";
import { prisma } from "@/lib/db";
import { getAppSettings } from "@/lib/settings";
import {
  validateGameId,
  getFazerCardsBalance,
  getFazerCardsOfferPrice,
  createFazerCardsOrder,
  FREE_FIRE_CIS_REGIONS,
} from "@/lib/fazercards";

const FREE_FIRE_GAME_SLUG = "free-fire-cis";
const FREE_FIRE_CATEGORY_ID = "free_fire_cis";

type AttemptParams = {
  id: string;
  userId: string;
  gameSlug: string;
  gameTitle: string;
  externalOfferId: string;
  gameIdentifier: string;
  priceTjs: number;
};

type RefundParams = {
  id: string;
  userId: string;
  gameTitle: string;
  priceTjs: number;
};

// Записывает причину, по которой авто-заказ НЕ был отправлен во внешний
// API (регион не СНГ, маржа ниже порога и т.п.) — заказ остаётся в обычной
// ручной очереди (status не меняется), это просто пометка для админа.
async function markNoAttempt(orderId: string, reason: string): Promise<void> {
  await prisma.order.update({ where: { id: orderId }, data: { autoOrderError: reason } }).catch(() => {});
}

// Реальный сбой авто-заказа — либо отправка не прошла (см.
// attemptFreeFireAutoOrder), либо поллинг (см. api/cron/fazer-poll) увидел
// у FazerCards терминальный failed/refunded статус. В обоих случаях деньги
// возвращаются на баланс сразу, заказ помечается failed и уходит в
// отдельный список для админа.
export async function refundOrderAndMarkFailed(order: RefundParams, reason: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "failed", autoOrderError: reason, processedAt: new Date() },
    });
    await tx.user.update({
      where: { id: order.userId },
      data: { balance: { increment: order.priceTjs } },
    });
    await tx.balanceTx.create({
      data: { userId: order.userId, amount: order.priceTjs, reason: "refund", refId: order.id },
    });
    await tx.notification.create({
      data: {
        userId: order.userId,
        message: `Возникла техническая проблема при автоматической обработке заказа «${order.gameTitle}» — ${order.priceTjs} TJS возвращены на баланс. Мы обработаем заказ вручную.`,
      },
    });
  });
}

// Пытается автоматически оформить Free Fire (CIS) заказ через FazerCards
// сразу после того, как заказ создан и баланс списан обычным путём (см.
// actions/orders.ts). Никогда не бросает наружу — при любой проблеме ДО
// отправки заказа во внешний API просто оставляет его в обычной ручной
// очереди; сбой именно отправки — единственный случай автоматического
// возврата денег (см. refundAndMarkFailed).
export async function attemptFreeFireAutoOrder(order: AttemptParams): Promise<void> {
  if (order.gameSlug !== FREE_FIRE_GAME_SLUG) return;

  try {
    const settings = await getAppSettings();
    const rate = Number(settings.usdToTjsRate);
    const marginMax = Number(settings.fazercardsMarginMax);

    // 1. Регион — авто-заказ только для СНГ/RU, иначе как раньше вручную.
    const validation = await validateGameId(order.gameSlug, order.gameIdentifier);
    if (validation.status !== "valid") {
      await markNoAttempt(order.id, `Проверка ID перед авто-заказом не удалась (${validation.status})`);
      return;
    }
    if (!validation.region || !FREE_FIRE_CIS_REGIONS.includes(validation.region)) {
      await markNoAttempt(order.id, `Регион игрока не СНГ (${validation.region ?? "неизвестен"})`);
      return;
    }

    // 2. Себестоимость и защита маржи.
    const offerPrice = await getFazerCardsOfferPrice(FREE_FIRE_CATEGORY_ID, order.externalOfferId);
    if (!offerPrice.ok) {
      await markNoAttempt(order.id, "Не удалось получить актуальную цену товара у FazerCards");
      return;
    }
    const costTjs = offerPrice.priceUsd * rate;
    const marginRatio = costTjs / order.priceTjs;
    if (marginRatio > marginMax) {
      await markNoAttempt(
        order.id,
        `Себестоимость ${(marginRatio * 100).toFixed(0)}% от цены продажи — выше порога ${(marginMax * 100).toFixed(0)}%`,
      );
      return;
    }

    // 3. Баланс FazerCards — не пытаться, если денег там не хватит.
    const balance = await getFazerCardsBalance();
    if (!balance.ok || balance.balanceUsd < offerPrice.priceUsd) {
      await markNoAttempt(order.id, "Недостаточно баланса FazerCards для авто-заказа");
      return;
    }

    // 4. Сам заказ. Idempotency-Key привязан к нашему Order.id — повтор
    // с тем же ключом (двойной клик/ретрай) вернёт тот же внешний заказ,
    // а не спишет с FazerCards второй раз.
    const created = await createFazerCardsOrder(
      FREE_FIRE_CATEGORY_ID,
      order.externalOfferId,
      { player_id: order.gameIdentifier },
      `order-${order.id}`,
    );

    if (created.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { externalOrderId: created.externalOrderId },
      });
      return;
    }

    await refundOrderAndMarkFailed(order, created.reason);
  } catch (e) {
    // Не должно случиться (внутренние функции сами ловят свои ошибки), но
    // подстраховка — не даём сбою здесь сломать уже оформленный заказ.
    await markNoAttempt(order.id, e instanceof Error ? e.message : "Неизвестная ошибка авто-заказа").catch(() => {});
  }
}
