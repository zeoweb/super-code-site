import { prisma } from "@/lib/db";
import { savePaymentMethod, togglePaymentMethod } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";

// Реквизиты для приёма оплаты (банки).
export default async function AdminMethodsPage() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { bankName: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Реквизиты оплаты</h1>

      <div className="mt-6 space-y-3">
        {methods.map((m) => (
          <details key={m.id} className="card overflow-hidden p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-800">
                  {m.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logoUrl} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-sm font-bold text-slate-900">{m.bankName.charAt(0)}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {m.bankName} {!m.isActive && <span className="badge text-slate-600">выкл</span>}
                  </div>
                  <div className="truncate text-sm text-slate-500">{m.phoneNumber} · {m.recipientName}</div>
                </div>
              </div>
            </summary>

            <div className="space-y-4 border-t border-slate-200 p-4">
              <form action={savePaymentMethod} className="space-y-3">
                <input type="hidden" name="id" value={m.id} />
                <div>
                  <label className="label">Банк</label>
                  <input name="bankName" defaultValue={m.bankName} className="input" required />
                </div>
                <div>
                  <label className="label">Номер / карта</label>
                  <input name="phoneNumber" defaultValue={m.phoneNumber} className="input" required />
                </div>
                <div>
                  <label className="label">Получатель</label>
                  <input name="recipientName" defaultValue={m.recipientName} className="input" />
                </div>
                <div>
                  <label className="label">Логотип (PNG/JPG/WEBP)</label>
                  <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
                  {m.logoUrl && (
                    <p className="mt-1 text-xs text-slate-600">
                      Сейчас загружен свой логотип — оставьте поле пустым, чтобы не менять.
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isActive" defaultChecked={m.isActive} /> Активен
                </label>
                <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="Сохраняем…">
                  Сохранить
                </SubmitButton>
              </form>

              <form action={togglePaymentMethod} className="border-t border-slate-200 pt-3">
                <input type="hidden" name="id" value={m.id} />
                <SubmitButton className="btn-ghost px-3 py-2 text-sm" pendingText="…">
                  {m.isActive ? "Деактивировать" : "Активировать"}
                </SubmitButton>
              </form>
            </div>
          </details>
        ))}
        {methods.length === 0 && (
          <p className="text-sm text-slate-600">Реквизитов пока нет — добавьте ниже.</p>
        )}
      </div>

      {/* Добавить новый */}
      <h2 className="mt-8 text-lg font-bold">Добавить реквизиты</h2>
      <form action={savePaymentMethod} className="card mt-3 space-y-3">
        <div>
          <label className="label">Банк</label>
          <input name="bankName" className="input" placeholder="Например, Алиф Банк" required />
        </div>
        <div>
          <label className="label">Номер / карта</label>
          <input name="phoneNumber" className="input" placeholder="+992 90 000 00 00" required />
        </div>
        <div>
          <label className="label">Получатель</label>
          <input name="recipientName" className="input" placeholder="ФИО получателя" />
        </div>
        <div>
          <label className="label">Логотип (PNG/JPG/WEBP)</label>
          <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked /> Активен
        </label>
        <SubmitButton className="btn-primary" pendingText="Сохраняем…">
          Сохранить
        </SubmitButton>
      </form>
    </div>
  );
}
