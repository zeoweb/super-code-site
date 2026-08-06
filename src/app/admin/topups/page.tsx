import Link from "next/link";
import { prisma } from "@/lib/db";
import { approveTopUp, rejectTopUp } from "@/app/actions/topups";
import { RejectButton } from "@/components/admin/RejectButton";
import { SubmitButton } from "@/components/SubmitButton";
import type { PaymentStatus, Prisma } from "@prisma/client";

const TABS: { key: PaymentStatus; label: string }[] = [
  { key: "pending", label: "Ожидают" },
  { key: "approved", label: "Одобрены" },
  { key: "rejected", label: "Отклонены" },
];

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Ожидает",
  approved: "Одобрена",
  rejected: "Отклонена",
};
const STATUS_CLASS: Record<PaymentStatus, string> = {
  pending: "border-yellow-500/40 text-amber-600",
  approved: "border-emerald-500/40 text-emerald-600",
  rejected: "border-red-500/40 text-red-600",
};

export default async function AdminTopUpsPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const tab = (["pending", "approved", "rejected"].includes(searchParams.tab ?? "")
    ? searchParams.tab
    : "pending") as PaymentStatus;

  // Поиск по пользователю игнорирует вкладку статуса и всегда показывает
  // ВСЕ его заявки — так видно всю историю попыток одного человека сразу.
  const where: Prisma.TopUpWhereInput = q
    ? {
        user: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        },
      }
    : { status: tab };

  const topups = await prisma.topUp.findMany({
    where,
    orderBy: q ? { createdAt: "desc" } : { createdAt: tab === "pending" ? "asc" : "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      paymentMethod: { select: { bankName: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Пополнения</h1>

      <form className="mt-4 flex gap-2" action="/admin/topups" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по имени, email, телефону"
          className="input"
        />
        <button className="btn-ghost">Найти</button>
      </form>

      {q ? (
        <p className="mt-4 text-sm text-slate-500">
          Найдено заявок: <strong>{topups.length}</strong> ·{" "}
          <Link href="/admin/topups" className="text-brand-light hover:underline">
            Сбросить поиск
          </Link>
        </p>
      ) : (
        <div className="mt-4 flex gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/admin/topups?tab=${t.key}`}
              className={
                "badge transition-colors duration-300 " +
                (t.key === tab ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")
              }
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {topups.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">{q ? "Ничего не найдено." : "Заявок нет."}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {topups.map((t) => (
            <div key={t.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{t.user.name}</span>
                    <span className={"badge " + STATUS_CLASS[t.status]}>{STATUS_LABEL[t.status]}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {t.user.email ?? "—"} · {t.user.phone ?? "—"}
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>{String(t.amount)} TJS</strong>
                    {t.paymentMethod && <> · {t.paymentMethod.bankName}</>}
                  </div>
                  <div className="text-xs text-slate-600">
                    {t.createdAt.toLocaleString("ru-RU")}
                  </div>
                  {t.adminComment && (
                    <div className="mt-1 text-xs text-red-600">Причина: {t.adminComment}</div>
                  )}
                </div>

                <a
                  href={t.receiptScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                  title="Открыть чек"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.receiptScreenshot}
                    alt="Чек"
                    className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                  />
                </a>
              </div>

              {t.status === "pending" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={approveTopUp}>
                    <input type="hidden" name="id" value={t.id} />
                    <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="Одобряем…">
                      Одобрить
                    </SubmitButton>
                  </form>
                  <RejectButton id={t.id} action={rejectTopUp} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
