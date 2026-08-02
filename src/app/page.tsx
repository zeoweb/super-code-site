import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NeuroIcon } from "@/components/NeuroIcon";

// Публичная витрина игр — главная страница, доступна без входа.
// Вход требуется только на моменте покупки/пополнения.
export default async function CatalogPage() {
  const session = await getSession();

  const games = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <main className="relative mx-auto min-h-screen max-w-5xl overflow-x-clip p-6 pb-16">

      <header className="flex items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-2 text-lg font-black tracking-tight">
          <NeuroIcon id="neuro-grad-catalog" className="h-7 w-7" />
          SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
        </div>
        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">В кабинет</Link>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm text-slate-600 hover:text-slate-900">
                Войти
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 text-sm">Регистрация</Link>
            </>
          )}
        </div>
      </header>

      <div className="mt-6 text-center">
        <span className="badge border-brand/40 text-brand-light">Мгновенное пополнение</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Выберите игру</h1>
        <p className="mt-2 text-slate-500">
          Алмазы, UC, пропуски и ваучеры — быстро и без наценок.
        </p>
      </div>

      {games.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-600">
          Игры скоро появятся — загляните позже.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {games.map((g) => (
            <Link
              key={g.id}
              href={`/games/${g.slug}`}
              className="card overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] hover:border-brand/40"
            >
              <div className="relative aspect-square bg-ink-800">
                {g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imageUrl} alt={g.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">🎮</div>
                )}
              </div>
              <div className="p-3 text-center">
                <div className="truncate text-sm font-bold">{g.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
