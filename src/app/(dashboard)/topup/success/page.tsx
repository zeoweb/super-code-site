import Link from "next/link";

export default function TopUpSuccessPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="card border-brand/40 text-center shadow-glow-lg">
        <div className="text-4xl">⏳</div>
        <h1 className="mt-2 text-xl font-bold">Заявка отправлена</h1>
        <p className="mt-1 text-sm text-slate-500">
          Админ проверит чек и пополнит баланс. Статус виден в истории.
        </p>
        <Link href="/history" className="btn-primary mt-4 inline-flex">Перейти в историю</Link>
      </div>
    </main>
  );
}
