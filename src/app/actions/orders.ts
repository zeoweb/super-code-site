"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { REFERRAL_PERCENT } from "@/lib/referral";

// Пользователь покупает пакет за баланс — списание мгновенное, выдачу
// валюты в игре админ подтверждает вручную (см. actions/admin-orders.ts).
export async function createOrder(formData: FormData): Promise<void> {
  const gameSlug = String(formData.get("gameSlug") ?? "");
  const packageId = String(formData.get("packageId") ?? "");
  const gameIdentifier = String(formData.get("gameIdentifier") ?? "").trim();
  const promoInput = String(formData.get("promoCode") ?? "").trim().toUpperCase();
  const back = `/games/${gameSlug}`;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(back)}`);

  if (!gameIdentifier) {
    redirect(`${back}?error=${encodeURIComponent("Введите игровой ID")}`);
  }

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    include: { game: true },
  });
  if (!pkg || !pkg.isActive || pkg.game.slug !== gameSlug) {
    redirect(`${back}?error=${encodeURIComponent("Товар недоступен")}`);
  }

  let price = pkg!.price;
  let promo: { id: string; discountPercent: number } | null = null;
  if (promoInput) {
    const now = new Date();
    const found = await prisma.promoCode.findUnique({ where: { code: promoInput } });
    const valid =
      found &&
      found.isActive &&
      (!found.validFrom || found.validFrom <= now) &&
      (!found.validUntil || found.validUntil >= now) &&
      (!found.maxUses || found.usedCount < found.maxUses);
    if (!valid) {
      redirect(`${back}?error=${encodeURIComponent("Промокод недействителен")}`);
    }
    const alreadyUsed = await prisma.promoCodeRedemption.findUnique({
      where: { userId_promoCodeId: { userId: user.id, promoCodeId: found!.id } },
    });
    if (alreadyUsed) {
      redirect(`${back}?error=${encodeURIComponent("Вы уже использовали этот промокод")}`);
    }
    promo = { id: found!.id, discountPercent: found!.discountPercent };
    price = price.mul(100 - promo.discountPercent).div(100);
  }

  if (user.balance.lessThan(price)) {
    redirect(`${back}?error=${encodeURIComponent("Недостаточно средств на балансе")}`);
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: user.id,
        gameId: pkg!.gameId,
        packageId: pkg!.id,
        gameIdentifier,
        price,
        status: "pending",
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { balance: { decrement: price } },
    });

    await tx.balanceTx.create({
      data: { userId: user.id, amount: price.negated(), reason: promo ? "promo" : "order", refId: order.id },
    });

    if (promo) {
      await tx.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      await tx.promoCodeRedemption.create({
        data: { userId: user.id, promoCodeId: promo.id, orderId: order.id },
      });
    }

    // Реферальный бонус — начисляется пригласившему сразу при покупке.
    if (user.referredById) {
      const bonus = price.mul(REFERRAL_PERCENT).div(100);
      await tx.user.update({
        where: { id: user.referredById },
        data: { balance: { increment: bonus } },
      });
      await tx.balanceTx.create({
        data: { userId: user.referredById, amount: bonus, reason: "referral", refId: order.id },
      });
    }
  }, { timeout: 20000 });

  revalidatePath("/history");
  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/history");
}
