"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingStartToday({ watchHref }: { watchHref: string }) {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-4xl px-6 py-8">
      <Reveal>
        <div className="card relative overflow-hidden py-14 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
          <span className="badge border-brand/40 text-brand-light">{t.startToday.badge}</span>
          <h2 className="mx-auto mt-4 max-w-xl text-2xl font-bold md:text-3xl">
            {t.startToday.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">{t.startToday.subtitle}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={watchHref} className="btn-primary px-8 text-lg">
              {t.startToday.primaryCta}
            </Link>
            <Link
              href="https://t.me/zeofps"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 px-6 text-lg"
            >
              <ChatIcon /> {t.startToday.telegramCta}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}
