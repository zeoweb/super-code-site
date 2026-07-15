"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingHero({
  watchHref,
  modulesCount,
  lessonsCount,
}: {
  watchHref: string;
  modulesCount: number;
  lessonsCount: number;
}) {
  const { t } = useLanguage();

  return (
    <section id="hero" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 pb-16 pt-16 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />

      <Reveal>
        <span className="badge border-brand/40 text-brand-light">{t.hero.badge}</span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {t.hero.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
          {t.hero.titleBefore}{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">{t.hero.titleAccent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">{t.hero.subtitle}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={watchHref} className="btn-primary px-8 text-lg">{t.hero.watchCta}</Link>
          <Link href="/register" className="btn-ghost px-8 text-lg">{t.hero.registerCta}</Link>
        </div>
      </Reveal>

      {/* Превью урока */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-xl">
          <Link
            href={watchHref}
            className="group relative block aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-700 to-ink-900 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-3xl text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                ▶
              </span>
            </div>
          </Link>
          <p className="mt-3 text-sm text-slate-500">{t.hero.previewCaption}</p>
        </div>
      </Reveal>

      {/* Метрики */}
      <Reveal delay={0.15}>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-4">
          <Stat value={String(modulesCount)} label={t.hero.statModules} />
          <Stat value={String(lessonsCount)} label={t.hero.statLessons} />
          <Stat value="4.9" label={t.hero.statRating} />
        </div>
      </Reveal>
    </section>
  );
}
