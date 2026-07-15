import Link from "next/link";
import { prisma } from "@/lib/db";
import { approvePayment } from "@/app/actions/admin";
import { RejectButton } from "@/components/admin/RejectButton";
import type { PaymentStatus } from "@prisma/client";

const TABS: { key: PaymentStatus; label: string }[] = [
  { key: "pending", label: "Ожидают" },
  { key: "approved", label: "Одобрены" },
  { key: "rejected", label: "Отклонены" },
];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = (["pending", "approved", "rejected"].includes(searchParams.tab ?? "")
    ? searchParams.tab
    : "pending") as PaymentStatus;

  const payments = await prisma.payment.findMany({
    where: { status: tab },
    orderBy: { createdAt: tab === "pending" ? "asc" : "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      paymentMethod: { select: { bankName: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Платежи</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/payments?tab=${t.key}`}
            className={
              "badge transition-colors duration-300 " +
              (t.key === tab ? "border-brand bg-brand/10 text-brand-light" : "text-slate-400")
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {payments.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Заявок нет.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{p.user.name}</div>
                  <div className="text-sm text-slate-400">
                    {p.user.email ?? "—"} · {p.user.phone ?? "—"}
                  </div>
                  <div className="mt-2 text-sm">
                    Тариф <strong>{p.tier.toUpperCase()}</strong> · {String(p.amount)} TJS
                    {p.paymentMethod && <> · {p.paymentMethod.bankName}</>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.createdAt.toLocaleString("ru-RU")}
                  </div>
                  {p.adminComment && (
                    <div className="mt-1 text-xs text-red-400">Причина: {p.adminComment}</div>
                  )}
                </div>

                {/* Скриншот чека */}
                <a
                  href={p.receiptScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0"
                  title="Открыть чек"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.receiptScreenshot}
                    alt="Чек"
                    className="h-24 w-24 rounded-lg border border-white/10 object-cover"
                  />
                </a>
              </div>

              {p.status === "pending" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={approvePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="btn-primary px-4 py-2 text-sm">Одобрить</button>
                  </form>
                  <RejectButton paymentId={p.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
