import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";
import { TIER_TITLES } from "@/lib/pricing";

// Шаг 2 из 3: выбор способа оплаты. Отдельная страница.
export default async function CheckoutMethodPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/billing/checkout");

  const tier = searchParams.tier;
  if (tier !== "plus" && tier !== "pro") redirect("/billing/checkout");

  const methods = await prisma.paymentMethod.findMany({
    where: { isActive: true },
    select: { id: true, bankName: true, phoneNumber: true, recipientName: true, logoUrl: true },
  });

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/billing/checkout" className="text-sm text-slate-400 hover:text-white">← Назад к тарифу</Link>

      <CheckoutStepIndicator step={2} />

      <h1 className="mt-4 text-2xl font-bold">Способ оплаты</h1>
      <p className="mt-1 text-slate-400">
        Тариф: <strong>{TIER_TITLES[tier]}</strong>. Шаг 2 из 3 — дальше реквизиты и чек.
      </p>

      <div className="mt-6 space-y-3">
        {methods.length === 0 ? (
          <>
            <p className="text-sm text-slate-500">
              Реквизиты пока не заданы. Обратитесь к куратору.
            </p>
            <Link href={`/billing/checkout/pay?tier=${tier}`} className="btn-ghost inline-flex">
              Продолжить без выбора банка
            </Link>
          </>
        ) : (
          methods.map((m) => (
            <Link
              key={m.id}
              href={`/billing/checkout/pay?tier=${tier}&method=${m.id}`}
              className="card flex items-center gap-4 transition-all duration-300 hover:scale-[1.01] hover:border-brand/40"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
                {m.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.logoUrl} alt={m.bankName} className="h-full w-full object-contain p-2" />
                ) : (
                  <span className="text-xl font-bold text-ink-900">{m.bankName.charAt(0)}</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-bold">{m.bankName}</div>
                <div className="truncate text-sm text-slate-400">Перевод по номеру · {m.recipientName}</div>
              </div>
              <ChevronIcon className="h-5 w-5 shrink-0 text-slate-500" />
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
    </svg>
  );
}
