const LABELS = ["Тариф", "Оплата", "Чек"];

export function CheckoutStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
      {LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span className={"flex items-center gap-1.5 " + (step >= i + 1 ? "text-brand-light" : "")}>
            <span className={"h-1.5 w-1.5 rounded-full " + (step >= i + 1 ? "bg-brand-gradient" : "bg-white/20")} />
            {label}
          </span>
          {i < LABELS.length - 1 && <span className="h-px w-4 bg-white/10" />}
        </div>
      ))}
    </div>
  );
}
