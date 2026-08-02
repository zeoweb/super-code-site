import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "В обработке",
  completed: "Выполнен",
  rejected: "Отклонён",
};
const ORDER_STATUS_CLASS: Record<string, string> = {
  completed: "border-emerald-500/40 text-emerald-600",
  rejected: "border-red-500/40 text-red-600",
  pending: "border-yellow-500/40 text-amber-600",
};
const TOPUP_STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает проверки",
  approved: "Одобрено",
  rejected: "Отклонено",
};
const TOPUP_STATUS_CLASS: Record<string, string> = {
  approved: "border-emerald-500/40 text-emerald-600",
  rejected: "border-red-500/40 text-red-600",
  pending: "border-yellow-500/40 text-amber-600",
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/history");

  const tab = searchParams.tab === "finance" ? "finance" : "orders";

  const [orders, topups] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { game: { select: { title: true } }, package: { select: { title: true } } },
    }),
    prisma.topUp.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { paymentMethod: { select: { bankName: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">История</h1>

      <div className="mt-4 flex gap-2">
        <Link
          href="/history?tab=orders"
          className={"badge transition-colors duration-300 " + (tab === "orders" ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")}
        >
          Заказы
        </Link>
        <Link
          href="/history?tab=finance"
          className={"badge transition-colors duration-300 " + (tab === "finance" ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")}
        >
          Финансы
        </Link>
      </div>

      {tab === "orders" ? (
        orders.length === 0 ? (
          <p className="mt-6 text-sm text-slate-600">Заказов пока нет.</p>
        ) : (
          <div className="mt-6 space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{o.game.title} · {o.package.title}</div>
                  <div className="text-xs text-slate-600">
                    {o.createdAt.toLocaleDateString("ru-RU")} · ID: {o.gameIdentifier}
                    {o.adminComment ? ` · ${o.adminComment}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-bold text-brand-light">{String(o.price)} смн</span>
                  <span className={"badge " + ORDER_STATUS_CLASS[o.status]}>{ORDER_STATUS_LABEL[o.status]}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : topups.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">Пополнений пока нет.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {topups.map((t) => (
            <div key={t.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">
                  Пополнение{t.paymentMethod ? ` · ${t.paymentMethod.bankName}` : ""}
                </div>
                <div className="text-xs text-slate-600">
                  {t.createdAt.toLocaleDateString("ru-RU")}
                  {t.adminComment ? ` · ${t.adminComment}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-bold text-brand-light">{String(t.amount)} смн</span>
                <span className={"badge " + TOPUP_STATUS_CLASS[t.status]}>{TOPUP_STATUS_LABEL[t.status]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
