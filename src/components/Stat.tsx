export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card py-4 text-center">
      <div className="text-2xl font-bold bg-brand-gradient bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
