import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { TIER_PRICES, TIER_TITLES } from "@/lib/pricing";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";

// Шаг 1 из 3: выбор тарифа. Отдельная страница — не часть /billing.
export default async function CheckoutTierPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/billing/checkout");

  return (
    <main className="mx-auto max-w-xl p-6">
      <Link href="/billing" className="text-sm text-slate-400 hover:text-white">← К тарифам</Link>

      <CheckoutStepIndicator step={1} />

      <h1 className="mt-4 text-2xl font-bold">Выберите тариф</h1>
      <p className="mt-1 text-slate-400">Шаг 1 из 3 — дальше выберем способ оплаты.</p>

      <div className="mt-6 space-y-3">
        {(["plus", "pro"] as const).map((t) => (
          <Link
            key={t}
            href={`/billing/checkout/method?tier=${t}`}
            className="card flex items-center justify-between transition-all duration-300 hover:scale-[1.01] hover:border-brand/40"
          >
            <span className="font-medium">{TIER_TITLES[t]}</span>
            <span className="font-bold text-brand-light">
              {TIER_PRICES[t]} сомони <span className="text-xs font-normal text-slate-500">навсегда</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
