"use client";

import { useMemo, useState } from "react";
import { createOrder } from "@/app/actions/orders";
import { SubmitButton } from "@/components/SubmitButton";

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
}: {
  gameSlug: string;
  packages: PackageItem[];
  error?: string;
}) {
  const regions = useMemo(
    () => Array.from(new Set(packages.map((p) => p.region).filter((r): r is string => !!r))),
    [packages],
  );
  const [region, setRegion] = useState<string | null>(regions[0] ?? null);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameIdentifier, setGameIdentifier] = useState("");

  const visible = regions.length > 0 ? packages.filter((p) => p.region === region) : packages;

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
                "card py-4 text-center transition-all duration-300 " +
                (selected === p.id ? "border-brand bg-brand-gradient text-white shadow-glow" : "hover:border-brand/40")
              }
            >
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

      <form id="order-form" action={createOrder}>
        <input type="hidden" name="gameSlug" value={gameSlug} />
        <input type="hidden" name="packageId" value={selected ?? ""} />
        <input type="hidden" name="gameIdentifier" value={gameIdentifier} />
        <SubmitButton
          className="btn-primary w-full disabled:opacity-40"
          pendingText="Оформляем…"
          disabled={!selected || !gameIdentifier.trim()}
        >
          {selected ? "Купить →" : "Выберите товар"}
        </SubmitButton>
      </form>
    </div>
  );
}
