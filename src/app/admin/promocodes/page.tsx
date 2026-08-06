import { prisma } from "@/lib/db";
import { createPromoCode, togglePromoCode, deletePromoCode } from "@/app/actions/promocodes";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminPromoCodesPage() {
  const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Промокоды</h1>
      <p className="mt-1 text-sm text-slate-500">
        Действуют как скидка на покупку товара в игре (шаг оплаты у карточки игры).
      </p>

      <form action={createPromoCode} className="card mt-6 space-y-3">
        <h2 className="font-semibold">Новый промокод</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Код</label>
            <input name="code" className="input uppercase" placeholder="WELCOME" required />
          </div>
          <div>
            <label className="label">Название (для пользователя)</label>
            <input name="title" className="input" placeholder="Первая покупка" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Скидка, %</label>
            <input name="discountPercent" type="number" min="1" max="100" className="input" required />
          </div>
          <div>
            <label className="label">Лимит использований</label>
            <input name="maxUses" type="number" min="1" className="input" placeholder="Без лимита" />
          </div>
        </div>
        <div>
          <label className="label">Действует до (опционально)</label>
          <input name="validUntil" type="date" className="input" />
        </div>
        <p className="text-xs text-slate-500">
          Каждый пользователь может применить код только один раз, независимо от общего лимита использований.
        </p>
        <SubmitButton className="btn-primary" pendingText="Создаём…">
          Создать
        </SubmitButton>
      </form>

      <h2 className="mt-8 text-lg font-bold">Все промокоды</h2>
      {promoCodes.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">Промокодов пока нет.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {promoCodes.map((p) => (
            <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono font-bold">
                  {p.code}{" "}
                  {!p.isActive && <span className="badge text-slate-600">выкл</span>}
                </div>
                {p.title && <div className="text-sm font-medium">{p.title}</div>}
                <div className="text-sm text-slate-500">
                  -{p.discountPercent}% · использован {p.usedCount}
                  {p.maxUses ? ` из ${p.maxUses}` : ""} раз
                  {p.validUntil ? ` · до ${p.validUntil.toLocaleDateString("ru-RU")}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <form action={togglePromoCode}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton className="btn-ghost px-3 py-1.5 text-xs" pendingText="…">
                    {p.isActive ? "Выключить" : "Включить"}
                  </SubmitButton>
                </form>
                <ConfirmDeleteButton action={deletePromoCode} id={p.id} confirmText={`Удалить промокод «${p.code}»?`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
