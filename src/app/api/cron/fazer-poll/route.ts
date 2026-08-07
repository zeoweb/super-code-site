import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getFazerCardsOrderStatus } from "@/lib/fazercards";
import { refundOrderAndMarkFailed } from "@/lib/fazerAutoOrder";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// FazerCards документирует только "processing" → "completed"/"refund" —
// всё, что не completed и не один из этих "ещё идёт" статусов, считаем
// неуспехом (а не только буквально "refund"), чтобы не зависнуть на
// незадокументированном варианте статуса.
const IN_PROGRESS_STATUSES = ["created", "processing"];
const STALE_AFTER_MS = 30 * 60 * 1000;

// Раз в минуту (см. vercel.json) проверяет все заказы, отправленные в
// FazerCards на авто-выдачу и всё ещё висящие у нас в pending — переводит
// в completed/failed по факту, либо (если висит дольше 30 минут) снимает
// с опроса и помечает для ручной проверки, чтобы не опрашивать вечно.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const candidates = await prisma.order.findMany({
    where: { status: "pending", externalOrderId: { not: null }, autoOrderError: null },
    include: { game: { select: { title: true } } },
  });

  const result = { checked: candidates.length, completed: 0, failed: 0, stalled: 0, stillProcessing: 0, pollErrors: 0 };

  for (const order of candidates) {
    const ageMs = Date.now() - order.createdAt.getTime();
    if (ageMs > STALE_AFTER_MS) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          autoOrderError: `Не завершилось за 30+ минут (${order.externalOrderId}) — проверьте вручную в кабинете FazerCards`,
        },
      });
      result.stalled++;
      continue;
    }

    const fazerStatus = await getFazerCardsOrderStatus(order.externalOrderId!);
    if (!fazerStatus.ok) {
      result.pollErrors++;
      continue;
    }

    if (fazerStatus.status === "completed") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: order.id }, data: { status: "completed", processedAt: new Date() } });
        await tx.notification.create({
          data: { userId: order.userId, message: `Заказ «${order.game.title}» выполнен автоматически ✅` },
        });
      });
      result.completed++;
    } else if (IN_PROGRESS_STATUSES.includes(fazerStatus.status)) {
      result.stillProcessing++;
    } else {
      await refundOrderAndMarkFailed(
        { id: order.id, userId: order.userId, gameTitle: order.game.title, priceTjs: Number(order.price) },
        fazerStatus.failReason ?? `FazerCards вернул статус "${fazerStatus.status}"`,
      );
      result.failed++;
    }
  }

  if (result.completed || result.failed) {
    revalidatePath("/history");
    revalidatePath("/profile");
    revalidatePath("/admin/orders");
  }

  return NextResponse.json({ ok: true, ...result });
}
