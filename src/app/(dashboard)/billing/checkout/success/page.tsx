import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="card border-brand/40 text-center shadow-glow-lg">
        <div className="text-4xl">⏳</div>
        <h1 className="mt-2 text-xl font-bold">Заявка отправлена</h1>
        <p className="mt-1 text-sm text-slate-400">
          Куратор проверит чек и откроет доступ. Статус виден в профиле.
        </p>
        <Link href="/profile" className="btn-primary mt-4 inline-flex">Перейти в профиль</Link>
      </div>
    </main>
  );
}
