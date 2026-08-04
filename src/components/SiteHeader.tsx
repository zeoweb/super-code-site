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
    { href: "/topup", label: dict.nav.topup },
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
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-black tracking-tight">
          <DiamondIcon id="diamond-grad-header" className="h-7 w-7" />
          SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
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
          <Link href="/login" className="btn-primary shrink-0 px-4 py-2 text-sm">Войти</Link>
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
