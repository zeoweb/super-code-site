import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function BonusCodesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/bonus-codes");

  const now = new Date();
  const candidates = await prisma.promoCode.findMany({
    where: {
      isActive: true,
      OR: [{ validFrom: null }, { validFrom: { lte: now } }],
      AND: [{ OR: [{ validUntil: null }, { validUntil: { gte: now } }] }],
      redemptions: { none: { userId: user.id } },
    },
    orderBy: { createdAt: "desc" },
  });
  const codes = candidates.filter((c) => !c.maxUses || c.usedCount < c.maxUses);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← К каталогу</Link>

      <h1 className="mt-3 text-2xl font-bold">Бонус коды 🎁</h1>
      <p className="mt-1 text-sm text-slate-500">Ваши активные бонус коды:</p>

      {codes.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">Пока нет доступных бонус-кодов — загляните позже.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {codes.map((c) => (
            <div key={c.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                {c.title && <div className="text-sm text-slate-500">{c.title}</div>}
                <div className="font-mono text-lg font-bold">{c.code}</div>
              </div>
              <span className="shrink-0 badge border-brand/40 text-brand-light">-{c.discountPercent}%</span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Введите код на шаге оплаты при покупке товара в игре — скидка применится к цене. Каждый код можно
        использовать только один раз.
      </p>
    </main>
  );
}
