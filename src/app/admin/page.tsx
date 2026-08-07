import { prisma } from "@/lib/db";
import { getFazerCardsBalance } from "@/lib/fazercards";

// Статистика/аналитика по ТЗ.
export default async function AdminStatsPage() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, topupsThisMonth, revenueAgg, ordersThisMonth, gamesCount, pendingTopups, fazerBalance] =
    await Promise.all([
      prisma.user.count(),
      prisma.topUp.count({
        where: { status: "approved", reviewedAt: { gte: monthAgo } },
      }),
      prisma.topUp.aggregate({
        where: { status: "approved", reviewedAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.game.count({ where: { isActive: true } }),
      prisma.topUp.count({ where: { status: "pending" } }),
      getFazerCardsBalance(),
    ]);

  const revenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Статистика</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard value={String(totalUsers)} label="Всего пользователей" />
        <StatCard value={String(topupsThisMonth)} label="Пополнений за 30 дней" />
        <StatCard value={`${revenue} TJS`} label="Выручка за 30 дней" />
        <StatCard value={String(ordersThisMonth)} label="Заказов за 30 дней" />
      </div>

      <h2 className="mt-8 text-lg font-bold">Сейчас</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard value={String(gamesCount)} label="Активных игр в каталоге" />
        <StatCard value={String(pendingTopups)} label="Заявок на пополнение ждут" />
        <StatCard
          value={fazerBalance.ok ? `$${fazerBalance.balanceUsd.toFixed(2)}` : "—"}
          label="Баланс FazerCards"
        />
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card">
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
