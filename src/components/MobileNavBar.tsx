"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Плавающая нижняя навигация — только на мобильных ширинах (на десктопе уже
// есть верхняя постоянная навигация в SiteHeader). Видна и гостю, и
// пользователю: клик по защищённым разделам уводит на логин через
// middleware, как и у верхней навигации.
export function MobileNavBar({ nav }: { nav: Dictionary["nav"] }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: nav.menu, icon: MenuIcon },
    { href: "/history", label: nav.history, icon: HistoryIcon },
    { href: "/about", label: nav.about, icon: InfoIcon },
    // "Играть" — всегда на русском (не через nav/dict), см. src/app/play.
    { href: "/play", label: "Играть", icon: PlayIcon },
    { href: "/profile", label: nav.profile, icon: ProfileIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-4 sm:hidden">
      <div className="flex items-center gap-0.5 rounded-full bg-ink-800 px-1.5 py-2 shadow-lg">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-full px-2.5 py-2 text-[10px] font-medium transition-colors duration-300 ${
                active ? "bg-brand text-white" : "text-slate-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.3" r="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2" y="7" width="16" height="9" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 9.5v4M4.5 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="13" cy="10.5" r="0.9" fill="currentColor" />
      <circle cx="15" cy="12.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
