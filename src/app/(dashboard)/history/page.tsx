import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { RefreshButton } from "@/components/RefreshButton";
import type { BalanceTxReason, OrderStatus } from "@prisma/client";

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

const ORDER_STATUS_FILTERS = [
  { key: "all", label: "Все" },
  { key: "completed", label: "Выполнен" },
  { key: "pending", label: "В ожидании" },
  { key: "rejected", label: "Отменён" },
];

const TXN_REASON_LABEL: Record<BalanceTxReason, string> = {
  topup: "Пополнение баланса",
  order: "Покупка в игре",
  referral: "Реферальный бонус",
  admin: "Корректировка",
  promo: "Бонус по промокоду",
};

const DIRECTION_FILTERS = [
  { key: "all", label: "Все" },
  { key: "in", label: "↓ Приход" },
  { key: "out", label: "↑ Расход" },
];

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { tab?: string; status?: string; direction?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/history");

  const tab = searchParams.tab === "finance" ? "finance" : "orders";
  const status = ["completed", "pending", "rejected"].includes(searchParams.status ?? "")
    ? searchParams.status!
    : "all";
  const direction = ["in", "out"].includes(searchParams.direction ?? "") ? searchParams.direction! : "all";

  const [orders, transactions] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id, ...(status !== "all" ? { status: status as OrderStatus } : {}) },
      orderBy: { createdAt: "desc" },
      include: { game: { select: { title: true } }, package: { select: { title: true } } },
    }),
    prisma.balanceTx.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const income = transactions.filter((t) => t.amount.greaterThan(0));
  const expense = transactions.filter((t) => t.amount.lessThan(0));
  const incomeTotal = income.reduce((sum, t) => sum + Number(t.amount), 0);
  const expenseTotal = expense.reduce((sum, t) => sum + Number(t.amount), 0);
  const visibleTransactions = direction === "in" ? income : direction === "out" ? expense : transactions;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">История</h1>
        <RefreshButton />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
        <Link
          href="/history?tab=orders"
          className={
            "rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-300 " +
            (tab === "orders" ? "bg-brand-gradient text-white shadow-glow" : "text-slate-600 hover:text-slate-900")
          }
        >
          Заказы
        </Link>
        <Link
          href="/history?tab=finance"
          className={
            "rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-300 " +
            (tab === "finance" ? "bg-brand-gradient text-white shadow-glow" : "text-slate-600 hover:text-slate-900")
          }
        >
          Финансы
        </Link>
      </div>

      {tab === "finance" && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <TrendUpIcon className="h-4 w-4 text-emerald-600" /> Итого приход
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">+{incomeTotal.toFixed(0)}</div>
            <div className="text-xs text-slate-500">сомони</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <TrendDownIcon className="h-4 w-4 text-red-600" /> Итого расход
            </div>
            <div className="mt-2 text-2xl font-bold text-red-600">{expenseTotal.toFixed(0)}</div>
            <div className="text-xs text-slate-500">сомони</div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {(tab === "orders" ? ORDER_STATUS_FILTERS : DIRECTION_FILTERS).map((f) => {
          const active = (tab === "orders" ? status : direction) === f.key;
          const href =
            tab === "orders" ? `/history?tab=orders&status=${f.key}` : `/history?tab=finance&direction=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={
                "badge transition-colors duration-300 " +
                (active ? "border-brand bg-brand-gradient text-white" : "text-slate-500")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {tab === "orders" ? (
        orders.length === 0 ? (
          <EmptyState icon={<ClockIcon className="h-6 w-6" />} label="Заказов нет" />
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
      ) : visibleTransactions.length === 0 ? (
        <EmptyState icon={<HistoryIcon className="h-6 w-6" />} label="Нет данных" />
      ) : (
        <div className="mt-6 space-y-2">
          {visibleTransactions.map((t) => {
            const positive = t.amount.greaterThan(0);
            return (
              <div key={t.id} className="card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{TXN_REASON_LABEL[t.reason]}</div>
                  <div className="text-xs text-slate-600">{t.createdAt.toLocaleDateString("ru-RU")}</div>
                </div>
                <span className={"shrink-0 font-bold " + (positive ? "text-emerald-600" : "text-red-600")}>
                  {positive ? "+" : ""}
                  {t.amount.toString()} смн
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-slate-400">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">{icon}</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4v4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l6-6 4 4 6-8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h5v5" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l6 6 4-4 6 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18h5v-5" />
    </svg>
  );
}
