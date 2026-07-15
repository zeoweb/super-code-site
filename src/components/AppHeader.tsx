import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { tierLabel } from "@/lib/access";
import type { Tier, Role } from "@prisma/client";

// Верхняя панель для авторизованных разделов.
export function AppHeader({
  name,
  tier,
  role,
}: {
  name: string;
  tier: Tier;
  role: Role;
}) {
  return (
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-5xl px-0 sm:top-6">
      <div className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-ink-800/60 p-2 pl-5 shadow-lg backdrop-blur-xl">
        <Link href="/dashboard" className="text-lg font-black tracking-tight">
          SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10">Курс</Link>
          <Link href="/billing" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10">Подписка</Link>
          <Link href="/profile" className="hidden rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10 sm:inline-block">Профиль</Link>
          <Link href="/leaderboard" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10">Рейтинг</Link>
          {role === "admin" && (
            <Link href="/admin" className="rounded-full px-3 py-2 text-brand-light transition-colors duration-300 hover:bg-white/10">Админка</Link>
          )}
          <span className="badge hidden text-slate-300 md:inline-flex">{tierLabel(tier)}</span>
          <span className="hidden text-slate-400 lg:inline">{name}</span>
          <form action={logoutAction}>
            <button className="rounded-full px-3 py-2 text-red-400 transition-colors duration-300 hover:bg-white/10">Выйти</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
