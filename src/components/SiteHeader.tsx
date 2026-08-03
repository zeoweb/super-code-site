"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NeuroIcon } from "@/components/NeuroIcon";
import { Avatar } from "@/components/Avatar";
import { logoutAction } from "@/app/actions/auth";
import type { Role } from "@prisma/client";

export type SiteHeaderUser = {
  name: string;
  avatarUrl?: string | null;
  balance: string;
  role: Role;
};

// Общая шапка для каталога и всех личных страниц (история/пополнение/профиль).
// Заменяет прежний постоянный сайдбар — навигация теперь через выпадающее
// меню у аватарки, сама шапка одинаковая что для гостя, что для пользователя.
export function SiteHeader({ user }: { user: SiteHeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
        <NeuroIcon id="neuro-grad-header" className="h-7 w-7" />
        SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">DONAT</span>
      </Link>

      {user ? (
        <div ref={menuRef} className="relative flex items-center gap-2">
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
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg">
              <div className="truncate border-b border-slate-100 px-4 py-2 text-sm font-semibold">
                {user.name}
              </div>
              <MenuLink href="/history" onNavigate={() => setOpen(false)}>История</MenuLink>
              <MenuLink href="/topup" onNavigate={() => setOpen(false)}>Пополнить</MenuLink>
              <MenuLink href="/profile" onNavigate={() => setOpen(false)}>Профиль</MenuLink>
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
        <Link href="/login" className="btn-primary px-4 py-2 text-sm">Войти</Link>
      )}
    </header>
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
