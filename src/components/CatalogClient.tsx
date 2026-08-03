"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader, type SiteHeaderUser } from "@/components/SiteHeader";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Game = { id: string; slug: string; title: string; imageUrl: string | null };

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => g.title.toLowerCase().includes(q));
  }, [games, query]);

  return (
    <>
      <SiteHeader user={user} search={{ value: query, onChange: setQuery }} dict={dict} />

      {filtered.length === 0 ? (
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
