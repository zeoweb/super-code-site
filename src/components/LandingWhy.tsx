"use client";

import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingWhy() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center">
      <Reveal>
        <span className="badge border-brand/40 text-brand-light">{t.why.badge}</span>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t.why.heading}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-400">{t.why.description}</p>
      </Reveal>

      <div className="mx-auto mt-8 max-w-md space-y-4 text-left">
        {t.why.steps.map((step, i) => (
          <Reveal key={step} delay={i * 0.1}>
            <div className="flex items-center gap-4 card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white">
                →
              </span>
              <span>{step}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <Link href="/register" className="btn-primary mt-8 inline-flex px-8 text-lg">
          {t.why.cta}
        </Link>
      </Reveal>
    </section>
  );
}
