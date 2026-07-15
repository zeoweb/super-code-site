"use client";

import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingFaq() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-16">
      <Reveal>
        <div className="text-center">
          <span className="badge border-brand/40 text-brand-light">{t.faq.badge}</span>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t.faq.heading}</h2>
        </div>
      </Reveal>

      <div className="mt-8 space-y-3">
        {t.faq.items.map((item, i) => (
          <Reveal key={item.q} delay={i * 0.06}>
            <details className="group card [&::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                <span>{item.q}</span>
                <span className="ml-4 shrink-0 text-lg text-brand-light transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-400">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
