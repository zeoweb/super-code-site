import { prisma } from "@/lib/db";

// Статистика/аналитика по ТЗ.
export default async function AdminStatsPage() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, byTier, approvedThisMonth, revenueAgg, lessonsCount, progressAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["tier"], _count: true }),
      prisma.payment.count({
        where: { status: "approved", reviewedAt: { gte: monthAgo } },
      }),
      prisma.payment.aggregate({
        where: { status: "approved", reviewedAt: { gte: monthAgo } },
        _sum: { amount: true },
      }),
      prisma.lesson.count(),
      prisma.lessonProgress.count({ where: { completed: true } }),
    ]);

  const tierMap: Record<string, number> = { none: 0, plus: 0, pro: 0 };
  byTier.forEach((r) => (tierMap[r.tier] = r._count));

  // Средний прогресс = (кол-во завершений) / (пользователи * уроки)
  const avgProgress =
    totalUsers > 0 && lessonsCount > 0
      ? Math.round((progressAgg / (totalUsers * lessonsCount)) * 100)
      : 0;

  const revenue = revenueAgg._sum.amount ? Number(revenueAgg._sum.amount) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold">Статистика</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard value={String(totalUsers)} label="Всего пользователей" />
        <StatCard value={String(approvedThisMonth)} label="Оплат за 30 дней" />
        <StatCard value={`${revenue} TJS`} label="Выручка за 30 дней" />
        <StatCard value={`${avgProgress}%`} label="Средний прогресс" />
      </div>

      <h2 className="mt-8 text-lg font-bold">Пользователи по тарифам</h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard value={String(tierMap.none)} label="Без подписки" />
        <StatCard value={String(tierMap.plus)} label="Plus+" />
        <StatCard value={String(tierMap.pro)} label="Pro" />
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card">
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
