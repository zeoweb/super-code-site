import { prisma } from "@/lib/db";
import { createExpense, deleteExpense } from "@/app/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

// Финансовая сводка: выручка считается напрямую из одобренных платежей,
// расходы — отдельная простая таблица, которую ведёт админ вручную.
export default async function AdminFinancePage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueAll, revenueMonth, expenses] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "approved" }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: "approved", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.expense.findMany({ orderBy: { spentAt: "desc" } }),
  ]);

  const totalRevenue = Number(revenueAll._sum.amount ?? 0);
  const monthRevenue = Number(revenueMonth._sum.amount ?? 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const net = totalRevenue - totalExpenses;

  return (
    <div>
      <h1 className="text-2xl font-bold">Финансы</h1>
      <p className="mt-1 text-sm text-slate-400">
        Выручка считается по одобренным платежам, расходы вносятся вручную.
      </p>

      {/* Сводка */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FinanceStat value={`${totalRevenue.toLocaleString("ru-RU")} TJS`} label="Выручка всего" />
        <FinanceStat value={`${monthRevenue.toLocaleString("ru-RU")} TJS`} label="Выручка за месяц" />
        <FinanceStat value={`${totalExpenses.toLocaleString("ru-RU")} TJS`} label="Расходы всего" />
        <FinanceStat value={`${net.toLocaleString("ru-RU")} TJS`} label="Чистыми" accent={net >= 0} />
      </div>

      {/* Добавить расход */}
      <form action={createExpense} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Добавить расход</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Название</label>
            <input name="title" className="input" placeholder="Напр. Реклама в Instagram" required />
          </div>
          <div>
            <label className="label">Сумма, TJS</label>
            <input name="amount" type="number" min="0" step="0.01" className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Категория (опционально)</label>
          <input name="category" className="input" placeholder="Напр. Маркетинг" />
        </div>
        <button className="btn-primary">Добавить расход</button>
      </form>

      {/* Список расходов */}
      <h2 className="mt-8 text-lg font-bold">История расходов</h2>
      {expenses.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Расходов пока нет.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-slate-500">
                  {e.spentAt.toLocaleDateString("ru-RU")}
                  {e.category ? ` · ${e.category}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-bold text-red-400">-{Number(e.amount).toLocaleString("ru-RU")} TJS</span>
                <ConfirmDeleteButton
                  action={deleteExpense}
                  id={e.id}
                  confirmText={`Удалить расход «${e.title}»?`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinanceStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="card py-4 text-center">
      <div
        className={
          "text-lg font-bold " +
          (accent === undefined
            ? "bg-brand-gradient bg-clip-text text-transparent"
            : accent
              ? "text-emerald-400"
              : "text-red-400")
        }
      >
        {value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
