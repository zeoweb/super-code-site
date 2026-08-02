import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

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
                </td>
                <td className="py-3 pr-4 text-slate-500">
                  <div>{u.email ?? "—"}</div>
                  <div>{u.phone ?? "—"}</div>
                </td>
                <td className="py-3 pr-4">{u.balance.toString()} TJS</td>
                <td className="py-3 pr-4">{u._count.orders}</td>
                <td className="py-3 pr-4 text-slate-500">
                  {u.createdAt.toLocaleDateString("ru-RU")}
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
          </div>
        ))}
      </div>
    </div>
  );
}
