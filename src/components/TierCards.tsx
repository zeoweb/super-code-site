import Link from "next/link";
import { TIER_PRICES, TIER_OLD_PRICES, TIER_TITLES } from "@/lib/pricing";

// Карточки тарифов Plus+/Pro — переиспользуются на /billing и в окне
// апгрейда, которое всплывает при попытке открыть платный урок.
export function TierCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card flex h-full flex-col">
        <span className="badge border-brand/40 text-brand-light">PLUS+</span>
        <h3 className="mt-2 text-lg font-bold">{TIER_TITLES.plus}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black">{TIER_PRICES.plus} сомони</span>
          <span className="text-base text-slate-500 line-through">{TIER_OLD_PRICES.plus}</span>
        </div>
        <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-300">
          <li>✓ 20 видеоуроков по вайб-кодингу</li>
          <li>✓ Создание ботов, сайтов, приложений через AI</li>
          <li>✓ Доступ к фичам платформы Super Code</li>
          <li>✓ Доступ навсегда</li>
        </ul>
        <Link href="/billing/checkout/method?tier=plus" className="btn-ghost mt-4 w-full text-center">
          Выбрать Plus+
        </Link>
      </div>
      <div className="card relative flex h-full flex-col border-brand/40 shadow-glow-lg">
        <span className="badge border-brand/40 bg-brand-gradient text-white">🔥 PRO</span>
        <h3 className="mt-2 text-lg font-bold">{TIER_TITLES.pro}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black">{TIER_PRICES.pro} сомони</span>
          <span className="text-base text-slate-500 line-through">{TIER_OLD_PRICES.pro}</span>
        </div>
        <ul className="mt-3 flex-1 space-y-1 text-sm text-slate-300">
          <li>✓ Всё из Plus+ (20 видеоуроков)</li>
          <li>✓ +15 уроков: боты без кода (no-code)</li>
          <li>✓ Канал: 50-70+ готовых кодов ботов</li>
          <li>✓ Код Cargo-бота (аналоги от $100)</li>
          <li>✓ Закрытый чат с другими участниками Pro</li>
          <li>✓ 1 бесплатная консультация лично от автора (хостинг, сайт и т.д.)</li>
        </ul>
        <Link href="/billing/checkout/method?tier=pro" className="btn-primary mt-4 w-full text-center">
          Выбрать Pro
        </Link>
      </div>
    </div>
  );
}
