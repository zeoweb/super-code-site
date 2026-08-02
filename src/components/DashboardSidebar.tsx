"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { NeuroIcon } from "@/components/NeuroIcon";
import { Avatar } from "@/components/Avatar";
import type { Role } from "@prisma/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Меню", icon: OverviewIcon },
  { href: "/history", label: "История", icon: HistoryIcon },
  { href: "/topup", label: "Пополнить", icon: TopUpIcon },
  { href: "/profile", label: "Профиль", icon: UserIcon },
];

// Боковая навигация личного кабинета. На десктопе — фиксированная колонка.
export function DashboardSidebar({
  name,
  avatarUrl,
  balance,
  role,
}: {
  name: string;
  avatarUrl?: string | null;
  balance: string;
  role: Role;
}) {
  const isAdmin = role === "admin";
  const pathname = usePathname();

  return (
    <>
      {/* Десктоп: боковая колонка на всю высоту */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-ink-900/80 backdrop-blur-xl md:flex">
        {/* Верх: логотип + домой */}
        <div className="flex items-center justify-between gap-2 p-5">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-black tracking-tight">
            <NeuroIcon id="neuro-grad-sidebar" />
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
          </Link>
          <Link
            href="/"
            aria-label="На главную"
            className="rounded-full p-1.5 text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-900"
          >
            <HomeIcon className="h-5 w-5" />
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.href.includes("#") && pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-300 " +
                  (isActive
                    ? "bg-brand-gradient text-white shadow-glow"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-2 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-300 transition-colors duration-300 hover:bg-amber-500/20"
            >
              <ShieldIcon className="h-5 w-5 shrink-0" />
              Админ-панель
            </Link>
          )}
        </nav>

        {/* Низ: карточка пользователя */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-ink-900/90 p-4 backdrop-blur-xl">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-1.5 -m-1.5 transition-colors duration-300 hover:bg-slate-100"
          >
            <Avatar name={name} avatarUrl={avatarUrl} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="truncate text-xs text-slate-500">Баланс: {balance} сомони</div>
            </div>
          </Link>

          <form action={logoutAction} className="mt-3">
            <button className="btn-ghost w-full justify-center border-red-500/30 py-2 text-sm text-red-600 hover:border-red-500/50 hover:bg-red-500/10">
              Выйти
            </button>
          </form>
        </div>
      </aside>

      {/* Мобайл: верхняя плавающая капсула — логотип + баланс.
          Фон/блюр вынесены в отдельный слой позади контента: на iOS Safari
          градиентный текст (bg-clip-text) не рендерится, если общий элемент
          одновременно использует backdrop-filter — это разделение чинит баг. */}
      <header className="sticky top-4 z-40 mx-4 md:hidden">
        <div className="pointer-events-none absolute inset-0 rounded-full border border-slate-200 bg-ink-800/60 shadow-lg backdrop-blur-xl" />
        <div className="relative flex items-center justify-between gap-2 px-4 py-3">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-base font-black tracking-tight">
            <NeuroIcon className="h-6 w-6" id="neuro-grad-mobile" />
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              aria-label="На главную"
              className="rounded-full p-1.5 text-slate-500 transition-colors duration-300 hover:bg-slate-100 hover:text-slate-900"
            >
              <HomeIcon className="h-5 w-5" />
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Админ-панель"
                className="rounded-full p-1.5 text-amber-400 transition-colors duration-300 hover:bg-amber-500/10"
              >
                <ShieldIcon className="h-5 w-5" />
              </Link>
            )}
            <span className="badge border-brand/40 text-brand-light">{balance} смн</span>
          </div>
        </div>
      </header>

      {/* Мобайл: нижняя плавающая капсула — таб-бар с навигацией.
          "Пополнить" — приподнятая круглая кнопка по центру, как в incurs.tj. */}
      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-stretch justify-around rounded-full border border-slate-200 bg-ink-800/60 px-2 py-1 shadow-lg backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.href.includes("#") && pathname === item.href;
          const Icon = item.icon;

          if (item.href === "/topup") {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-1 flex-col items-center justify-end gap-1 pb-1.5 text-[11px] font-medium"
              >
                <span
                  className={
                    "absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient shadow-glow-lg transition-transform duration-300 " +
                    (isActive ? "scale-110" : "hover:scale-105")
                  }
                >
                  <Icon className="h-7 w-7 text-white" />
                </span>
                <span className={isActive ? "text-brand-light" : "text-slate-600"}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={
                "flex flex-1 flex-col items-center gap-1 rounded-full py-2 text-[11px] font-medium transition-colors duration-300 " +
                (isActive ? "text-brand-light" : "text-slate-600 hover:text-slate-600")
              }
            >
              <span
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300 " +
                  (isActive ? "bg-brand-gradient/20" : "")
                }
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

function OverviewIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function TopUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path strokeLinecap="round" d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 5 6v5.5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.25 12 1.75 1.75L14.75 10" />
    </svg>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11.5 12 4l8 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
