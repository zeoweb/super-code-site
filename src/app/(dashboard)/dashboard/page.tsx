import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "В обработке",
  completed: "Выполнен",
  rejected: "Отклонён",
};

// Личный кабинет: баланс, последние заказы и уведомления. Каталог игр — на /.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/dashboard");

  const [ordersCount, topupsCount, recentOrders, recentNotifications] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.topUp.count({ where: { userId: user.id, status: "approved" } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { game: { select: { title: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, message: true, createdAt: true },
    }),
  ]);

  return (
    <main className="relative mx-auto max-w-4xl overflow-hidden p-6 pt-10">

      {/* Hero */}
      <Reveal>
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="badge border-brand/40 text-brand-light">Личный кабинет</span>
              <h1 className="mt-2 text-2xl font-bold">Привет, {user.name}!</h1>
              <p className="mt-1 max-w-md text-slate-500">
                Ваш баланс: <strong>{user.balance.toString()} сомони</strong>. Выберите игру и
                пополните её мгновенно.
              </p>
            </div>
            <Link href="/" className="btn-primary shrink-0 px-6 py-3">
              Выбрать игру →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Стат-плашки */}
      <Reveal delay={0.05}>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value={`${user.balance.toString()}`} label="Баланс, смн" />
          <Stat value={String(ordersCount)} label="Заказов" />
          <Stat value={String(topupsCount)} label="Пополнений" />
        </div>
      </Reveal>

      {/* Последние заказы */}
      <Reveal delay={0.1}>
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">🎮 Последние заказы</span>
            <Link href="/history" className="text-sm text-brand-light hover:underline">Все</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Заказов пока нет.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{o.game.title}</span>
                  <span className="shrink-0 text-slate-500">{String(o.price)} смн</span>
                  <span className="badge shrink-0 border-slate-200 text-xs">
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Пополнение баланса — призыв */}
      <Reveal delay={0.15}>
        <div className="card mt-4 bg-gradient-to-br from-brand/10 to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-semibold">💳 Пополните баланс</span>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Переведите сумму по реквизитам — баланс появится после проверки чека.
              </p>
            </div>
            <Link href="/topup" className="btn-primary shrink-0">
              Пополнить →
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Активность */}
      <Reveal delay={0.2}>
        <div className="card mt-4">
          <span className="font-semibold">🔔 Активность</span>
          {recentNotifications.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Пока ничего нового.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {recentNotifications.map((n) => (
                <div key={n.id} className="text-sm text-slate-600">
                  {n.message}
                  <span className="ml-2 text-xs text-slate-600">
                    {n.createdAt.toLocaleDateString("ru-RU")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </main>
  );
}
