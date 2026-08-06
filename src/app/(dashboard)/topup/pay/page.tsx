import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { submitTopUp } from "@/app/actions/payments";
import { SubmitButton } from "@/components/SubmitButton";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";
import { CopyButton } from "@/components/CopyButton";
import { ReceiptFileInput } from "@/components/ReceiptFileInput";
import { PaymentCountdown } from "@/components/PaymentCountdown";
import { TOPUP_MIN_AMOUNT, TOPUP_MAX_AMOUNT } from "@/lib/topup";

// Шаг 3 из 3: реквизиты выбранного банка + сумма + чек.
export default async function TopUpPayPage({
  searchParams,
}: {
  searchParams: { amount?: string; method?: string; error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/topup");

  const amount = Number(searchParams.amount);
  if (!Number.isFinite(amount) || amount < TOPUP_MIN_AMOUNT || amount > TOPUP_MAX_AMOUNT) redirect("/topup");

  const method = searchParams.method
    ? await prisma.paymentMethod.findUnique({
        where: { id: searchParams.method },
        select: { id: true, bankName: true, phoneNumber: true, recipientName: true },
      })
    : null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href={`/topup/method?amount=${amount}`} className="text-sm text-slate-500 hover:text-slate-900">
        ← Назад к способу оплаты
      </Link>

      <CheckoutStepIndicator step={3} />

      <h1 className="mt-4 text-2xl font-bold">Реквизиты и чек</h1>
      <p className="mt-1 text-slate-500">Переведите сумму и прикрепите скриншот чека.</p>

      <div className="card mt-6 overflow-hidden p-0">
        {method && (
          <div className="space-y-3 border-b border-slate-200 bg-brand-gradient/10 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="badge border-brand/40 bg-ink-900/60 font-semibold text-white">
                {method.bankName}
              </span>
              <PaymentCountdown />
            </div>

            <div className="rounded-xl border border-slate-200 bg-ink-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Номер телефона</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-lg font-bold tracking-wide">{method.phoneNumber}</span>
                <CopyButton value={method.phoneNumber} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-ink-900/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Получатель</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-base font-semibold">{method.recipientName}</span>
                <CopyButton value={method.recipientName} />
              </div>
            </div>

            <ol className="space-y-1.5 pt-1 text-sm text-slate-600">
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">К оплате</span>
              <span className="text-xl font-black text-brand-light">{amount} сомони</span>
            </div>
          </div>

          <form action={submitTopUp} className="mt-4 space-y-4">
            <input type="hidden" name="amount" value={amount} />
            {method && <input type="hidden" name="paymentMethodId" value={method.id} />}

            <ReceiptFileInput />

            {searchParams.error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{searchParams.error}</p>
            )}

            <SubmitButton pendingText="Отправляем…">Отправить на проверку</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
