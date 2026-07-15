"use client";

import Link from "next/link";
import { NeuroIcon } from "@/components/NeuroIcon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingHeader({
  isLoggedIn,
  watchHref,
}: {
  isLoggedIn: boolean;
  watchHref: string;
}) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl sm:top-6">
      <div className="flex items-center justify-between gap-0.5 rounded-full border border-white/10 bg-ink-800/60 p-1.5 pl-2 shadow-lg backdrop-blur-xl sm:gap-3 sm:p-2 sm:pl-4">
        <Link href="/" className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NeuroIcon id="neuro-grad-landing-header" className="h-5 w-5 sm:h-7 sm:w-7" />
          <span className="leading-tight">
            <span className="block text-base font-black tracking-tight sm:text-lg">
              SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>
            </span>
            <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">
              {t.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-slate-300 md:flex">
          <a href="#hero" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10 hover:text-white">{t.nav.free}</a>
          <a href="#reviews" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10 hover:text-white">{t.nav.reviews}</a>
          <a href="#faq" className="rounded-full px-3 py-2 transition-colors duration-300 hover:bg-white/10 hover:text-white">{t.nav.faq}</a>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <LanguageSwitcher />
          <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">{t.header.dashboard}</Link>
            ) : (
              <>
                <Link href="/login" className="whitespace-nowrap rounded-full px-1 py-1.5 text-xs text-slate-300 transition-colors duration-300 hover:text-white sm:px-3 sm:py-2 sm:text-sm">{t.header.login}</Link>
                {/* Мобильный CTA короче ("Начать" вместо "Регистрация") и ведёт сразу на бесплатный
                    урок — иначе логотип с подписью и обе кнопки не помещаются на узких экранах (320-375px). */}
                <Link href={watchHref} className="btn-primary whitespace-nowrap px-2 py-1.5 text-xs sm:hidden">{t.header.start}</Link>
                <Link href="/register" className="btn-ghost hidden whitespace-nowrap sm:inline-flex sm:px-4 sm:py-2 sm:text-sm">{t.header.register}</Link>
                <Link href={watchHref} className="btn-primary hidden px-4 py-2 text-sm sm:inline-flex">{t.header.start}</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
