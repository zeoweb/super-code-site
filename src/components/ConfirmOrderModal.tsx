"use client";

import { SubmitButton } from "@/components/SubmitButton";

// Экран подтверждения перед фактическим списанием — даёт заметить опечатку
// в ID до, а не после оплаты. Реальное списание/создание Order происходит
// только по клику "Оплатить" здесь (это submit самой формы заказа — модалка
// рендерится внутри <form>, чтобы SubmitButton видел её через useFormStatus).
export function ConfirmOrderModal({
  itemTypeLabel,
  gameTitle,
  productTitle,
  playerId,
  price,
  onClose,
}: {
  itemTypeLabel: string;
  gameTitle: string;
  productTitle: string;
  playerId: string;
  price: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-ink-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-lg font-bold">Проверьте заказ</h2>
        <p className="mt-1 text-center text-sm text-slate-500">Всё верно? Продолжаем?</p>

        <div className="mt-5 space-y-2.5 text-sm">
          <Row label={itemTypeLabel} value={gameTitle} />
          <Row label="Продукт" value={productTitle} />
          <Row label="Player ID" value={playerId} />
          <Row label="Цена" value={`${price} смн`} emphasize />
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Отмена
          </button>
          <SubmitButton className="btn-primary flex-1" pendingText="Оформляем…">
            Оплатить
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className={emphasize ? "font-bold text-brand-light" : "min-w-0 truncate font-medium"}>{value}</span>
    </div>
  );
}
