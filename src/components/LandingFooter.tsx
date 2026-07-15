"use client";

import Link from "next/link";
import { NeuroIcon } from "@/components/NeuroIcon";
import { useLanguage } from "@/components/LanguageProvider";

export function LandingFooter() {
  const { t } = useLanguage();
  const { education, account, contact } = t.footer.columns;

  return (
    <footer className="mx-auto max-w-5xl px-6 pb-16 pt-10">
      <div className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-black tracking-tight">
            <NeuroIcon className="h-6 w-6" id="neuro-grad-footer" />
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">{t.footer.description}</p>
        </div>

        <FooterColumn title={education.title} links={education.links} />
        <FooterColumn title={account.title} links={account.links} />
        <FooterColumn title={contact.title} links={contact.links} />
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
        <span>© {new Date().getFullYear()} Super Code</span>
        <span>{t.footer.madeIn}</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-slate-500">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="transition-colors duration-300 hover:text-brand-light">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
