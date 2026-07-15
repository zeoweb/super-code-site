import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/Reveal";
import { TierCards } from "@/components/TierCards";
import { tierLabel } from "@/lib/access";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/billing");

  return (
      <main className="relative mx-auto max-w-3xl overflow-hidden p-6 pt-10">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />

        <Reveal>
          <span className="badge border-brand/40 text-brand-light">Доступ</span>
          <h1 className="mt-2 text-2xl font-bold">Подписка</h1>
          <p className="mt-1 text-slate-400">
            Ваш текущий тариф: <strong>{tierLabel(user.tier)}</strong>. Оплата через банк —
            как при обычной покупке курса: переведите сумму по реквизитам и прикрепите чек.
          </p>
        </Reveal>

        {/* Тарифы */}
        <Reveal delay={0.05} className="mt-6">
          <TierCards />
        </Reveal>

        {/* Оплата — отдельный визард на своих страницах, шаг за шагом */}
        <Reveal delay={0.25}>
          <div className="card mt-8 text-center">
            <h2 className="text-lg font-bold">Готовы оформить?</h2>
            <p className="mt-1 text-sm text-slate-400">
              Выберете тариф, способ оплаты и прикрепите чек — на трёх отдельных шагах.
            </p>
            <Link href="/billing/checkout" className="btn-primary mt-4 inline-flex px-8">
              Оформить →
            </Link>
          </div>
        </Reveal>
      </main>
  );
}
