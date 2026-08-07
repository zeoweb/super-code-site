import { getAppSettings } from "@/lib/settings";
import { getFazerCardsBalance } from "@/lib/fazercards";
import { updateAppSettings } from "@/app/actions/settings";
import { SubmitButton } from "@/components/SubmitButton";

export default async function AdminSettingsPage() {
  const [settings, fazerBalance] = await Promise.all([getAppSettings(), getFazerCardsBalance()]);
  const marginMaxPercent = Number(settings.fazercardsMarginMax) * 100;

  return (
    <div>
      <h1 className="text-2xl font-bold">Настройки</h1>

      <div className="card mt-6 max-w-md space-y-4">
        <h2 className="font-semibold">Авто-заказ FazerCards (Free Fire, CIS)</h2>
        <p className="text-sm text-slate-500">
          Баланс FazerCards сейчас:{" "}
          <strong>{fazerBalance.ok ? `$${fazerBalance.balanceUsd.toFixed(2)}` : "недоступен"}</strong>
        </p>

        <form action={updateAppSettings} className="space-y-3">
          <div>
            <label className="label">Курс USD → TJS</label>
            <input
              name="usdToTjsRate"
              type="number"
              step="0.0001"
              min="0.0001"
              defaultValue={settings.usdToTjsRate.toString()}
              className="input"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Используется для пересчёта себестоимости FazerCards (USD) в сомони.</p>
          </div>
          <div>
            <label className="label">Максимальная себестоимость от цены продажи, %</label>
            <input
              name="fazercardsMarginMaxPercent"
              type="number"
              step="1"
              min="1"
              max="100"
              defaultValue={marginMaxPercent.toString()}
              className="input"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Если себестоимость товара у FazerCards выше этого процента от цены продажи — авто-заказ не
              делается, заявка уходит в ручную очередь.
            </p>
          </div>
          <SubmitButton className="btn-primary px-4 py-2 text-sm" pendingText="Сохраняем…">
            Сохранить
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
