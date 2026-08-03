"use client";

import Link from "next/link";

export function InsufficientFundsModal({
  balance,
  price,
  onClose,
}: {
  balance: string;
  price: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-ink-800 p-6 text-center shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-600">
          <WalletIcon className="h-7 w-7" />
        </span>

        <h2 className="mt-4 text-lg font-bold">Недостаточно средств</h2>

        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Баланс:</span>
            <span className="font-medium">{balance} сомони</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Нужно:</span>
            <span className="font-medium">{price} сомони</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Закрыть
          </button>
          <Link href="/topup" className="btn-primary flex-1">
            Пополнить →
          </Link>
        </div>
      </div>
    </div>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5" />
      <rect x="3" y="8" width="18" height="11" rx="2.5" />
      <circle cx="16" cy="13.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
