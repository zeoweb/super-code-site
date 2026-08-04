"use client";

import { useMemo, useState } from "react";
import { Gem, Ticket, BadgeCheck, Package } from "lucide-react";
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
  imageUrl: string | null;
};

// Порядок и подписи типов товара — общие для всех игр (конкретные названия
// вроде "110 алмазов" или "6 Level Up" всегда берутся из title пакета).
const KIND_ORDER = ["currency", "voucher", "pass", "bundle"];
const KIND_LABEL: Record<string, string> = {
  currency: "Валюта",
  voucher: "Ваучер",
  pass: "Пропуск",
  bundle: "Набор",
};

// Пока нет уникальной картинки под каждый товар — generic-иконка по типу.
const KIND_ICON: Record<string, typeof Gem> = {
  currency: Gem,
  voucher: Ticket,
  pass: BadgeCheck,
  bundle: Package,
};
const KIND_ICON_BG: Record<string, string> = {
  currency: "bg-sky-500",
  bundle: "bg-emerald-500",
  voucher: "bg-amber-500",
  pass: "bg-violet-500",
};

// Стандартный набор регионов — показываем все три, даже если для части из
// них пока нет пакетов (админ дозаполнит через admin/games). Любые другие
// регионы, встреченные в данных, добавляются вслед за стандартными.
const STANDARD_REGIONS = ["GLOBAL", "IN", "BR"];

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
  const regionsFromData = useMemo(
    () => Array.from(new Set(packages.map((p) => p.region).filter((r): r is string => !!r))),
    [packages],
  );
  const regions = useMemo(() => {
    if (regionsFromData.length === 0) return [];
    const extras = regionsFromData.filter((r) => !STANDARD_REGIONS.includes(r));
    return [...STANDARD_REGIONS, ...extras];
  }, [regionsFromData]);

  const [region, setRegion] = useState<string | null>(regions[0] ?? null);
  const [kind, setKind] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [gameIdentifier, setGameIdentifier] = useState("");
  const [idChecked, setIdChecked] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const regionPackages = useMemo(
    () => (regions.length > 0 ? packages.filter((p) => p.region === region) : packages),
    [packages, region, regions],
  );
  const kinds = useMemo(() => {
    const present = new Set(regionPackages.map((p) => p.kind));
    return KIND_ORDER.filter((k) => present.has(k));
  }, [regionPackages]);
  const activeKind = kind && kinds.includes(kind) ? kind : kinds[0] ?? null;

  const visible = kinds.length > 1 && activeKind ? regionPackages.filter((p) => p.kind === activeKind) : regionPackages;
  const selectedPackage = packages.find((p) => p.id === selected) ?? null;

  function selectRegion(r: string) {
    setRegion(r);
    setKind(null);
    setSelected(null);
  }

  function selectKind(k: string) {
    setKind(k);
    setSelected(null);
  }

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
        <div className="flex gap-2">
          <input
            id="gameIdentifier"
            value={gameIdentifier}
            onChange={(e) => {
              setGameIdentifier(e.target.value);
              setIdChecked(false);
            }}
            className="input flex-1"
            placeholder="Введите ID или номер телефона"
          />
          <button
            type="button"
            onClick={() => gameIdentifier.trim() && setIdChecked(true)}
            disabled={!gameIdentifier.trim()}
            className="btn-ghost shrink-0 px-4 disabled:opacity-40"
          >
            Проверить
          </button>
        </div>
        {idChecked && <p className="mt-1.5 text-xs text-emerald-600">✓ ID сохранён</p>}
      </div>

      {regions.length > 0 && (
        <div>
          <p className="label">Регион</p>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRegion(r)}
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

      {kinds.length > 1 && (
        <div>
          <p className="label">Тип товара</p>
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => selectKind(k)}
                className={
                  "badge transition-colors duration-300 " +
                  (activeKind === k ? "border-brand bg-brand/10 text-brand-light" : "text-slate-500")
                }
              >
                {KIND_LABEL[k] ?? k}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="label">Товар</p>
        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Товары для этого региона скоро появятся.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {visible.map((p) => {
              const Icon = KIND_ICON[p.kind] ?? Gem;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={
                    "card relative flex flex-col items-center gap-2 py-4 text-center transition-all duration-300 " +
                    (selected === p.id ? "border-brand bg-brand-gradient text-white shadow-glow" : "hover:border-brand/40")
                  }
                >
                  {selected === p.id && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                  )}
                  <span
                    className={
                      "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full " +
                      (p.imageUrl ? "bg-ink-700" : (KIND_ICON_BG[p.kind] ?? "bg-slate-500"))
                    }
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-6 w-6 text-white" />
                    )}
                  </span>
                  <div className="font-semibold">{p.title}</div>
                  <div className={"text-sm " + (selected === p.id ? "text-white/90" : "text-slate-500")}>
                    {p.price} смн
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
