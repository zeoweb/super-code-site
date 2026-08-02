"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepIndicator } from "@/components/CheckoutStepIndicator";

// Шаг 1 из 3 флоу пополнения: выбор суммы (быстрые варианты или своя).
export function AmountPicker({ quickAmounts }: { quickAmounts: number[] }) {
  const [amount, setAmount] = useState(quickAmounts[3] ?? quickAmounts[0]);
  const router = useRouter();

  function onContinue() {
    if (!amount || amount < 1) return;
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

      <div className="card mt-3 flex items-center justify-between gap-3">
        <input
          type="number"
          min={1}
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full bg-transparent text-xl font-bold outline-none"
          placeholder="0"
        />
        <span className="shrink-0 text-sm text-slate-600">сомони</span>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!amount || amount < 1}
        className="btn-primary mt-6 w-full disabled:opacity-40"
      >
        Продолжить →
      </button>
    </>
  );
}
