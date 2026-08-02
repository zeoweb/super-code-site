import Link from "next/link";
import { prisma } from "@/lib/db";
import { completeOrder, rejectOrder } from "@/app/actions/admin-orders";
import { RejectButton } from "@/components/admin/RejectButton";
import type { OrderStatus } from "@prisma/client";

const TABS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "В обработке" },
  { key: "completed", label: "Выполнены" },
  { key: "rejected", label: "Отклонены" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = (["pending", "completed", "rejected"].includes(searchParams.tab ?? "")
    ? searchParams.tab
    : "pending") as OrderStatus;

  const orders = await prisma.order.findMany({
    where: { status: tab },
    orderBy: { createdAt: tab === "pending" ? "asc" : "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      game: { select: { title: true } },
      package: { select: { title: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Заказы</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/orders?tab=${t.key}`}
            className={
              "badge transition-colors duration-300 " +
              (t.key === tab ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">Заказов нет.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{o.user.name}</div>
                  <div className="text-sm text-slate-500">
                    {o.user.email ?? "—"} · {o.user.phone ?? "—"}
                  </div>
                  <div className="mt-2 text-sm">
                    {o.game.title} · <strong>{o.package.title}</strong> · {String(o.price)} TJS
                  </div>
                  <div className="text-sm text-slate-600">ID игрока: {o.gameIdentifier}</div>
                  <div className="text-xs text-slate-600">{o.createdAt.toLocaleString("ru-RU")}</div>
                  {o.adminComment && (
                    <div className="mt-1 text-xs text-red-600">Причина: {o.adminComment}</div>
                  )}
                </div>
              </div>

              {o.status === "pending" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={completeOrder}>
                    <input type="hidden" name="id" value={o.id} />
                    <button className="btn-primary px-4 py-2 text-sm">Выдано ✅</button>
                  </form>
                  <RejectButton id={o.id} action={rejectOrder} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
