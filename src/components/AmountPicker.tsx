"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";
import { TOPUP_MIN_AMOUNT, TOPUP_MAX_AMOUNT } from "@/lib/topup";

// Шаг 1 из 3 флоу пополнения: выбор суммы (быстрые варианты или своя).
export function AmountPicker({ quickAmounts }: { quickAmounts: number[] }) {
  const [amount, setAmount] = useState(quickAmounts[3] ?? quickAmounts[0]);
  const router = useRouter();

  const touched = amount !== null && amount !== undefined;
  const belowMin = touched && amount > 0 && amount < TOPUP_MIN_AMOUNT;
  const aboveMax = touched && amount > TOPUP_MAX_AMOUNT;
  const isValid = touched && amount >= TOPUP_MIN_AMOUNT && amount <= TOPUP_MAX_AMOUNT;

  function onContinue() {
    if (!isValid) return;
    router.push(`/topup/method?amount=${amount}`);
  }

  return (
    <>
      <CheckoutStepIndicator step={1} />

      <p className="mt-4 text-xs uppercase tracking-wide text-slate-600">Выберите сумму</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        {quickAmounts.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            className={
              "card py-4 text-center font-semibold transition-all duration-300 " +
              (amount === a ? "border-brand bg-brand-gradient text-white shadow-glow" : "hover:border-brand/40")
            }
          >
            {a} сомони
          </button>
        ))}
      </div>

      <div
        className={
          "card mt-3 flex items-center justify-between gap-3 " +
          (belowMin || aboveMax ? "border-red-500/50" : "")
        }
      >
        <input
          type="number"
          min={TOPUP_MIN_AMOUNT}
          max={TOPUP_MAX_AMOUNT}
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full bg-transparent text-xl font-bold outline-none"
          placeholder="0"
        />
        <span className="shrink-0 text-sm text-slate-600">сомони</span>
      </div>

      {(belowMin || aboveMax) && (
        <p className="mt-2 text-sm text-red-600">
          {belowMin
            ? `Минимальная сумма пополнения — ${TOPUP_MIN_AMOUNT} сомони`
            : `Максимальная сумма пополнения — ${TOPUP_MAX_AMOUNT} сомони`}
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!isValid}
        className="btn-primary mt-6 w-full disabled:opacity-40"
      >
        Продолжить →
      </button>
    </>
  );
}
