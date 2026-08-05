"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DiamondIcon } from "@/components/DiamondIcon";
import { Avatar } from "@/components/Avatar";
import { MobileNavBar } from "@/components/MobileNavBar";
import { logoutAction } from "@/app/actions/auth";
import type { Role } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type SiteHeaderUser = {
  name: string;
  avatarUrl?: string | null;
  balance: string;
  role: Role;
};

// Общая шапка для каталога и всех личных страниц (история/пополнение/профиль).
// Постоянная горизонтальная навигация (Меню/История/Пополнить) видна всегда —
// и гостю, и пользователю; для гостя клик по Истории/Пополнить уводит на
// логин через middleware. Профиль/Админка/Выход — в выпадающем меню аватарки.
export function SiteHeader({
  user,
  dict,
}: {
  user: SiteHeaderUser | null;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: "/", label: dict.nav.menu },
    { href: "/history", label: dict.nav.history },
    { href: "/about", label: dict.nav.about },
    // "Играть" — отдельный раздел, всегда на русском (не через dict), см. src/app/play.
    { href: "/play", label: "Играть" },
  ];
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <>
    <header className="py-4">
      {/* На мобильных — плавающий тёмный стеклянный бар (статичные цвета,
          не завязанные на ink-/slate- токены темы, чтобы гарантированно
          оставаться тёмным независимо от светлой/тёмной темы сайта):
          фиолетово-чёрный градиент, свечение по краю + мягкая тень снизу
          для эффекта "парения", отступ mb-4 перед следующим блоком. На
          sm+ — сбрасываем обратно к обычной прозрачной шапке. */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-gradient-to-br from-[#33217a]/90 via-[#180f30]/90 to-black/85 px-4 py-2.5 shadow-[0_0_22px_-4px_rgba(139,124,255,0.55),0_18px_36px_-14px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:mb-0 sm:rounded-none sm:border-0 sm:bg-none sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-none">
        <Link
          href="/"
          className="flex shrink-0 flex-col text-lg font-black leading-none tracking-tight text-white sm:flex-row sm:items-center sm:gap-2 sm:text-slate-900"
        >
          <span className="flex items-center gap-2">
            <DiamondIcon id="diamond-grad-header" className="h-7 w-7" />
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
          </span>
          <span className="mt-1 text-[10px] font-medium normal-case tracking-normal text-slate-400 sm:hidden">
            Пополнение игровой валюты
          </span>
        </Link>

        {user ? (
          <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
            <Link href="/topup" className="badge border-brand/40 text-brand-light">
              {user.balance} смн
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Меню аккаунта"
              aria-expanded={open}
              className="rounded-full transition-transform duration-300 hover:scale-105"
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="h-9 w-9" textSize="text-sm" />
            </button>

            {open && (
              <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-ink-800 py-1.5 shadow-lg">
                <div className="truncate border-b border-slate-100 px-4 py-2 text-sm font-semibold">
                  {user.name}
                </div>
                <MenuLink href="/profile" onNavigate={() => setOpen(false)}>{dict.nav.profile}</MenuLink>
                {user.role === "admin" && (
                  <MenuLink href="/admin" onNavigate={() => setOpen(false)} className="text-amber-600">
                    Админ-панель
                  </MenuLink>
                )}
                <form action={logoutAction} className="border-t border-slate-100">
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors duration-300 hover:bg-slate-50">
                    Выйти
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-primary shrink-0 rounded-full px-5 py-2 text-sm shadow-[0_4px_18px_-2px_rgba(139,124,255,0.65)] sm:rounded-xl sm:px-4 sm:shadow-md"
          >
            Войти
          </Link>
        )}
      </div>

      <nav className="mt-3 hidden items-center gap-4 text-sm font-medium sm:flex">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "text-slate-900"
                  : "text-slate-500 transition-colors duration-300 hover:text-slate-900"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
    <MobileNavBar nav={dict.nav} />
    </>
  );
}

function MenuLink({
  href,
  children,
  onNavigate,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`block px-4 py-2 text-sm text-slate-700 transition-colors duration-300 hover:bg-slate-50 ${className}`}
    >
      {children}
    </Link>
  );
}
