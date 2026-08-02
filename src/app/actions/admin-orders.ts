"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// --- Админ подтверждает/отклоняет заказ (ручная выдача валюты в игре) ---
// timeout увеличен: см. комментарий в actions/topups.ts.

export async function completeOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const order = await prisma.order.findUnique({ where: { id }, include: { game: true } });
  if (!order || order.status !== "pending") return;

  await prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: "completed", processedAt: new Date() },
      });
      await tx.notification.create({
        data: { userId: order.userId, message: `Заказ «${order.game.title}» выполнен ✅` },
      });
    },
    { timeout: 20000 },
  );

  revalidatePath("/admin/orders");
  revalidatePath("/history");
}

export async function rejectOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return;

  const order = await prisma.order.findUnique({ where: { id }, include: { game: true } });
  if (!order || order.status !== "pending") return;

  // Отклонение — возвращаем деньги на баланс (списание было мгновенным).
  await prisma.$transaction(
    async (tx) => {
      await tx.order.update({
        where: { id },
        data: { status: "rejected", adminComment: comment, processedAt: new Date() },
      });
      await tx.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.price } },
      });
      await tx.balanceTx.create({
        data: { userId: order.userId, amount: order.price, reason: "admin", refId: order.id },
      });
      await tx.notification.create({
        data: {
          userId: order.userId,
          message: `Заказ «${order.game.title}» отклонён: ${comment}. Средства возвращены на баланс.`,
        },
      });
    },
    { timeout: 20000 },
  );

  revalidatePath("/admin/orders");
  revalidatePath("/history");
  revalidatePath("/profile");
}
