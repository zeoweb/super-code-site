import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { submitPayment } from "@/app/actions/payments";
import { TIER_PRICES, TIER_TITLES } from "@/lib/pricing";
import { SubmitButton } from "@/components/SubmitButton";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";
import { CopyButton } from "@/components/CopyButton";
import { ReceiptFileInput } from "@/components/ReceiptFileInput";
import { PaymentCountdown } from "@/components/PaymentCountdown";

// Шаг 3 из 3: реквизиты выбранного банка + сумма выбранного тарифа + чек.
export default async function CheckoutPayPage({
  searchParams,
}: {
  searchParams: { tier?: string; method?: string; error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/billing/checkout");

  const tier = searchParams.tier;
  if (tier !== "plus" && tier !== "pro") redirect("/billing/checkout");

  const method = searchParams.method
    ? await prisma.paymentMethod.findUnique({
        where: { id: searchParams.method },
        select: { id: true, bankName: true, phoneNumber: true, recipientName: true },
      })
    : null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href={`/billing/checkout/method?tier=${tier}`} className="text-sm text-slate-400 hover:text-white">
        ← Назад к способу оплаты
      </Link>

      <CheckoutStepIndicator step={3} />

      <h1 className="mt-4 text-2xl font-bold">Реквизиты и чек</h1>
      <p className="mt-1 text-slate-400">Переведите сумму и прикрепите скриншот чека.</p>

      <div className="card mt-6 overflow-hidden p-0">
        {/* Реквизиты: банк + номер телефона + получатель — каждый отдельным блочком */}
        {method && (
          <div className="space-y-3 border-b border-white/10 bg-brand-gradient/10 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="badge border-brand/40 bg-ink-900/60 font-semibold text-white">
                {method.bankName}
              </span>
              <PaymentCountdown />
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Номер телефона</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-lg font-bold tracking-wide">{method.phoneNumber}</span>
                <CopyButton value={method.phoneNumber} />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Получатель</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-base font-semibold">{method.recipientName}</span>
                <CopyButton value={method.recipientName} />
              </div>
            </div>

            <ol className="space-y-1.5 pt-1 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand/40 text-[11px] text-brand-light">1</span>
                Откройте приложение вашего банка
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand/40 text-[11px] text-brand-light">2</span>
                Перевод → по номеру телефона
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand/40 text-[11px] text-brand-light">3</span>
                Введите номер и имя получателя
              </li>
            </ol>
          </div>
        )}

        <div className="p-5">
          {/* Сумма — отдельным блочком, как тариф + сумма */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">К оплате · {TIER_TITLES[tier]}</span>
              <span className="text-xl font-black text-brand-light">{TIER_PRICES[tier]} сомони</span>
            </div>
          </div>

          <form action={submitPayment} className="mt-4 space-y-4">
            <input type="hidden" name="tier" value={tier} />
            {method && <input type="hidden" name="paymentMethodId" value={method.id} />}

            <ReceiptFileInput />

            {searchParams.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{searchParams.error}</p>
            )}

            <SubmitButton pendingText="Отправляем…">Отправить на проверку</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
