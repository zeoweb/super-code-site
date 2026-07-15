import { prisma } from "@/lib/db";
import { tierLabel } from "@/lib/access";
import { BroadcastForm } from "@/components/BroadcastForm";
import type { Tier } from "@prisma/client";

const HISTORY_LIMIT = 20;

// Массовая рассылка сообщений ученикам — доставляется в чат с куратором.
export default async function AdminBroadcastPage() {
  const [totalStudents, byTier, history] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.groupBy({ by: ["tier"], where: { role: "student" }, _count: true }),
    prisma.broadcast.findMany({ orderBy: { createdAt: "desc" }, take: HISTORY_LIMIT }),
  ]);

  const countByTier = new Map(byTier.map((t) => [t.tier, t._count]));
  const audiences = [
    { value: "all", label: "Все ученики", count: totalStudents },
    { value: "none", label: tierLabel("none"), count: countByTier.get("none") ?? 0 },
    { value: "plus", label: tierLabel("plus"), count: countByTier.get("plus") ?? 0 },
    { value: "pro", label: tierLabel("pro"), count: countByTier.get("pro") ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Рассылка</h1>
      <p className="mt-1 text-sm text-slate-400">
        Отправьте сообщение всем ученикам или сегменту по тарифу — оно придёт каждому в чат с куратором.
      </p>

      <div className="mt-6 max-w-xl">
        <BroadcastForm audiences={audiences} />
      </div>

      <h2 className="mt-8 text-lg font-bold">История рассылок</h2>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Рассылок пока не было.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {history.map((b) => (
            <div key={b.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="badge border-white/10 text-slate-300">
                  {b.audience ? tierLabel(b.audience as Tier) : "Все ученики"} · {b.recipientCount}
                </span>
                <span className="text-xs text-slate-500">{b.createdAt.toLocaleString("ru-RU")}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{b.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
