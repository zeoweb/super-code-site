"use client";

import { useMemo, useState } from "react";
import { createOrder } from "@/app/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";
import { InsufficientFundsModal } from "@/components/InsufficientFundsModal";

type PackageItem = {
  id: string;
  region: string | null;
  kind: string;
  title: string;
  amount: number;
  price: string;
};

const KIND_LABEL: Record<string, string> = {
  currency: "Валюта",
  pass: "Пропуск",
  voucher: "Ваучер",
};

export function PackagePicker({
  gameSlug,
  packages,
  error,
  balance,
}: {
  gameSlug: string;
  packages: PackageItem[];
  error?: string;
  balance: string | null;
}) {
  const regions = useMemo(
    () => Array.from(new Set(packages.map((p) => p.region).filter((r): r is string => !!r))),
    [packages],
  );
  const [region, setRegion] = useState<string | null>(regions[0] ?? null);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameIdentifier, setGameIdentifier] = useState("");
  const [showInsufficient, setShowInsufficient] = useState(false);

  const visible = regions.length > 0 ? packages.filter((p) => p.region === region) : packages;
  const selectedPackage = packages.find((p) => p.id === selected) ?? null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (selectedPackage && balance !== null && Number(balance) < Number(selectedPackage.price)) {
      e.preventDefault();
      setShowInsufficient(true);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <label className="label" htmlFor="gameIdentifier">Игровой ID</label>
        <input
          id="gameIdentifier"
          value={gameIdentifier}
          onChange={(e) => setGameIdentifier(e.target.value)}
          className="input"
          placeholder="Введите ID или номер телефона"
        />
      </div>

      {regions.length > 0 && (
        <div>
          <p className="label">Регион</p>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={
                  "badge transition-colors duration-300 " +
                  (region === r ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="label">Товар</p>
        <div className="grid grid-cols-2 gap-3">
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={
                "card relative py-4 text-center transition-all duration-300 " +
                (selected === p.id ? "border-brand bg-brand-gradient text-white shadow-glow" : "hover:border-brand/40")
              }
            >
              {selected === p.id && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand">
                  <CheckIcon className="h-3 w-3" />
                </span>
              )}
              <div className="font-semibold">{p.title}</div>
              {p.kind !== "currency" && (
                <div className={"mt-0.5 text-xs " + (selected === p.id ? "text-white/70" : "text-slate-600")}>
                  {KIND_LABEL[p.kind] ?? p.kind}
                </div>
              )}
              <div className={"mt-1 text-sm " + (selected === p.id ? "text-white/90" : "text-slate-500")}>
                {p.price} смн
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="promoCode">Промокод (опционально)</label>
        <input id="promoCode" name="promoCode" form="order-form" className="input uppercase" placeholder="WELCOME" />
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}

      <form id="order-form" action={createOrder} onSubmit={handleSubmit}>
        <input type="hidden" name="gameSlug" value={gameSlug} />
        <input type="hidden" name="packageId" value={selected ?? ""} />
        <input type="hidden" name="gameIdentifier" value={gameIdentifier} />

        {selectedPackage && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-ink-800/95 p-4 backdrop-blur-xl">
            <div className="mx-auto max-w-xl">
              <SubmitButton
                className="btn-primary w-full disabled:opacity-40"
                pendingText="Оформляем…"
                disabled={!gameIdentifier.trim()}
              >
                Купить — {selectedPackage.price} сомони
              </SubmitButton>
            </div>
          </div>
        )}
      </form>

      {selectedPackage && <div className="h-24" aria-hidden />}

      {showInsufficient && selectedPackage && balance !== null && (
        <InsufficientFundsModal
          balance={balance}
          price={selectedPackage.price}
          onClose={() => setShowInsufficient(false)}
        />
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  );
}
