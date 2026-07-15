import { prisma } from "@/lib/db";
import { setUserTier } from "@/app/actions/admin";
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
    include: { _count: { select: { progress: { where: { completed: true } } } } },
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
          <thead className="text-left text-slate-400">
            <tr className="border-b border-white/10">
              <th className="py-2 pr-4">Имя</th>
              <th className="py-2 pr-4">Контакты</th>
              <th className="py-2 pr-4">Пройдено</th>
              <th className="py-2 pr-4">Регистрация</th>
              <th className="py-2 pr-4">Тариф</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">
                  {u.name}
                  {u.role === "admin" && (
                    <span className="ml-2 badge border-brand/40 text-brand-light">admin</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-slate-400">
                  <div>{u.email ?? "—"}</div>
                  <div>{u.phone ?? "—"}</div>
                </td>
                <td className="py-3 pr-4">{u._count.progress} уроков</td>
                <td className="py-3 pr-4 text-slate-400">
                  {u.createdAt.toLocaleDateString("ru-RU")}
                </td>
                <td className="py-3 pr-4">
                  <form action={setUserTier} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="tier" defaultValue={u.tier} className="input py-1">
                      <option value="none">Без подписки</option>
                      <option value="plus">Plus+</option>
                      <option value="pro">Pro</option>
                    </select>
                    <button className="btn-ghost px-3 py-1 text-xs">OK</button>
                  </form>
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
            <div className="mt-1 text-sm text-slate-400">
              <div>{u.email ?? "—"}</div>
              <div>{u.phone ?? "—"}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="badge border-white/10">{u._count.progress} уроков</span>
              <span className="badge border-white/10">{u.createdAt.toLocaleDateString("ru-RU")}</span>
            </div>
            <form action={setUserTier} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="id" value={u.id} />
              <select name="tier" defaultValue={u.tier} className="input flex-1 py-1.5 text-sm">
                <option value="none">Без подписки</option>
                <option value="plus">Plus+</option>
                <option value="pro">Pro</option>
              </select>
              <button className="btn-ghost shrink-0 px-3 py-1.5 text-xs">OK</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
