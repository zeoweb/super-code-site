"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// --- Заявки на пополнение баланса (чек на модерации) ---
// timeout увеличен: Neon-компьют после простоя "просыпается" не мгновенно,
// дефолтные 5с интерактивной транзакции Prisma иногда не хватает.

export async function approveTopUp(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const topup = await prisma.topUp.findUnique({ where: { id } });
  if (!topup || topup.status !== "pending") return;

  await prisma.$transaction(
    async (tx) => {
      await tx.topUp.update({
        where: { id },
        data: { status: "approved", reviewedAt: new Date() },
      });
      await tx.user.update({
        where: { id: topup.userId },
        data: { balance: { increment: topup.amount } },
      });
      await tx.balanceTx.create({
        data: { userId: topup.userId, amount: topup.amount, reason: "topup", refId: topup.id },
      });
      await tx.notification.create({
        data: {
          userId: topup.userId,
          message: `Пополнение на ${topup.amount} сомони одобрено — баланс обновлён 🎉`,
        },
      });
    },
    { timeout: 20000 },
  );

  revalidatePath("/admin/topups");
  revalidatePath("/profile");
  revalidatePath("/history");
  revalidatePath("/");
}

export async function rejectTopUp(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!comment) return; // причина обязательна (поле required на клиенте)

  const topup = await prisma.topUp.findUnique({ where: { id } });
  if (!topup || topup.status !== "pending") return;

  await prisma.$transaction(
    async (tx) => {
      await tx.topUp.update({
        where: { id },
        data: { status: "rejected", adminComment: comment, reviewedAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId: topup.userId,
          message: `Пополнение на ${topup.amount} сомони отклонено: ${comment}`,
        },
      });
    },
    { timeout: 20000 },
  );

  revalidatePath("/admin/topups");
  revalidatePath("/history");
}
