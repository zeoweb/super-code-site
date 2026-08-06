import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { adjustUserBalance, toggleUserBan } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Пользователи</h1>

      {/* Поиск */}
      <form className="mt-4 flex gap-2" action="/admin/users" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени, email, телефону"
          className="input"
        />
        <button className="btn-ghost">Найти</button>
      </form>

      {/* Десктоп: таблица */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-4">Имя</th>
              <th className="py-2 pr-4">Контакты</th>
              <th className="py-2 pr-4">Баланс</th>
              <th className="py-2 pr-4">Заказов</th>
              <th className="py-2 pr-4">Регистрация</th>
              <th className="py-2 pr-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 align-top">
                <td className="py-3 pr-4">
                  {u.name}
                  {u.role === "admin" && (
                    <span className="ml-2 badge border-brand/40 text-brand-light">admin</span>
                  )}
                  {u.isBanned && (
                    <span className="ml-2 badge border-red-500/40 text-red-600">заблокирован</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-slate-500">
                  <div>{u.email ?? "—"}</div>
                  <div>{u.phone ?? "—"}</div>
                </td>
                <td className="py-3 pr-4">
                  <div>{u.balance.toString()} TJS</div>
                  <BalanceAdjustForm userId={u.id} />
                </td>
                <td className="py-3 pr-4">{u._count.orders}</td>
                <td className="py-3 pr-4 text-slate-500">
                  {u.createdAt.toLocaleDateString("ru-RU")}
                </td>
                <td className="py-3 pr-4">
                  <BanToggleButton userId={u.id} isBanned={u.isBanned} isAdmin={u.role === "admin"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Мобайл: карточки вместо таблицы */}
      <div className="mt-6 space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="card">
            <div className="flex items-center gap-2">
              <span className="min-w-0 truncate font-medium">{u.name}</span>
              {u.role === "admin" && (
                <span className="badge shrink-0 border-brand/40 text-brand-light">admin</span>
              )}
              {u.isBanned && (
                <span className="badge shrink-0 border-red-500/40 text-red-600">заблокирован</span>
              )}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              <div>{u.email ?? "—"}</div>
              <div>{u.phone ?? "—"}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="badge border-slate-200">{u.balance.toString()} TJS</span>
              <span className="badge border-slate-200">{u._count.orders} заказов</span>
              <span className="badge border-slate-200">{u.createdAt.toLocaleDateString("ru-RU")}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
              <BalanceAdjustForm userId={u.id} />
              <BanToggleButton userId={u.id} isBanned={u.isBanned} isAdmin={u.role === "admin"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ручная корректировка баланса — проводится через BalanceTx (reason: admin),
// а не прямым изменением поля balance, чтобы попадать в общий журнал
// (см. actions/admin.ts: adjustUserBalance). Сумма может быть положительной
// (начисление) или отрицательной (списание). idempotencyKey генерируется
// заново при каждой отрисовке страницы (revalidatePath после сабмита даёт
// новый ключ на следующую форму) — повторный сабмит ЭТОЙ же формы всегда
// несёт один и тот же ключ, что и защищает от двойного начисления.
function BalanceAdjustForm({ userId }: { userId: string }) {
  const idempotencyKey = randomUUID();
  return (
    <details className="mt-1.5">
      <summary className="inline-block cursor-pointer list-none text-xs font-medium text-brand-light hover:underline">
        Скорректировать баланс
      </summary>
      <form action={adjustUserBalance} className="mt-2 max-w-xs space-y-2">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <input
          name="amount"
          inputMode="decimal"
          placeholder="Сумма, напр. +50 или -20"
          className="input py-1.5 text-sm"
          required
        />
        <input
          name="note"
          placeholder="Причина (необязательно)"
          className="input py-1.5 text-sm"
        />
        <SubmitButton className="btn-primary px-3 py-1.5 text-xs" pendingText="Применяем…">
          Применить
        </SubmitButton>
      </form>
    </details>
  );
}

// Блокировка/разблокировка — блокирует логин и деньги-действия (заказы,
// пополнения), см. loginAction/getCurrentUser. Админов блокировать нельзя
// (см. toggleUserBan).
function BanToggleButton({
  userId,
  isBanned,
  isAdmin,
}: {
  userId: string;
  isBanned: boolean;
  isAdmin: boolean;
}) {
  if (isAdmin) return <span className="text-xs text-slate-400">—</span>;

  return (
    <form action={toggleUserBan}>
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton
        className={
          "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-300 " +
          (isBanned
            ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
            : "border-red-500/40 text-red-600 hover:bg-red-50")
        }
        pendingText="…"
      >
        {isBanned ? "Разблокировать" : "Заблокировать"}
      </SubmitButton>
    </form>
  );
}
