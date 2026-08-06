import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AmountPicker } from "@/components/AmountPicker";
import { Reveal } from "@/components/Reveal";

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

export default async function TopUpPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/topup");

  return (
    <main className="relative mx-auto max-w-xl overflow-hidden p-6 pt-10">

      <Reveal>
        <span className="badge border-brand/40 text-brand-light">Баланс</span>
        <h1 className="mt-2 text-2xl font-bold">Пополнение баланса</h1>
        <p className="mt-1 text-slate-500">
          Ваш баланс: <strong>{user.balance.toString()} сомони</strong>. Выберите сумму или введите
          свою — дальше способ оплаты и чек.
        </p>
      </Reveal>

      {searchParams.error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{searchParams.error}</p>
      )}

      <Reveal delay={0.1} className="mt-6">
        <AmountPicker quickAmounts={QUICK_AMOUNTS} />
      </Reveal>
    </main>
  );
}
