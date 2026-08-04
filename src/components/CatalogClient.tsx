"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader, type SiteHeaderUser } from "@/components/SiteHeader";
import { SearchInput } from "@/components/SearchInput";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Game = { id: string; slug: string; title: string; imageUrl: string | null };

const SECTIONS = [
  { key: "games", label: "Игры" },
  { key: "services", label: "Сервисы" },
  { key: "soft", label: "Софт" },
] as const;
type Section = (typeof SECTIONS)[number]["key"];

export function CatalogClient({
  user,
  games,
  dict,
}: {
  user: SiteHeaderUser | null;
  games: Game[];
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section>("games");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.title.toLowerCase().includes(q));
  }, [games, query]);

  return (
    <>
      <SiteHeader user={user} dict={dict} />

      {user && <BalanceMiniMenu balance={user.balance} />}

      <div className="mt-4">
        <SearchInput search={{ value: query, onChange: setQuery }} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSection(s.key)}
            className={
              "rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-300 " +
              (section === s.key ? "bg-brand-gradient text-white shadow-glow" : "text-slate-600 hover:text-slate-900")
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {section !== "games" ? (
        <p className="mt-12 text-center text-sm text-slate-600">Раздел скоро появится.</p>
      ) : filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-600">
          {games.length === 0 ? "Игры скоро появятся — загляните позже." : "Ничего не найдено"}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((g) => (
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
    </>
  );
}

function BalanceMiniMenu({ balance }: { balance: string }) {
  return (
    <div className="mt-4 rounded-3xl bg-brand-gradient p-5 text-white shadow-glow">
      <div className="text-sm text-white/80">Баланс</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="text-3xl font-black">{balance}</span>
        <span className="text-sm font-medium text-white/80">сомони</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniMenuAction href="/topup" label="Пополнить счёт" icon={<WalletIcon className="h-5 w-5" />} />
        <MiniMenuAction href="/bonus-codes" label="Бонус коды" icon={<TicketIcon className="h-5 w-5" />} />
        <MiniMenuAction href="/support" label="Поддержка" icon={<ChatIcon className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function MiniMenuAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/25 bg-white/10 py-3 text-center transition-colors duration-300 hover:bg-white/20"
    >
      {icon}
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </Link>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V8H5.5A2.5 2.5 0 0 1 3 5.5" />
      <rect x="3" y="8" width="18" height="11" rx="2.5" />
      <circle cx="16" cy="13.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 6 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-6Z"
      />
      <path strokeLinecap="round" strokeDasharray="2 2" d="M14 7v10" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}
