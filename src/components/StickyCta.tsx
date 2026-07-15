"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export function StickyCta({ href }: { href: string }) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-ink-800/80 px-5 py-3 shadow-glow-lg backdrop-blur-xl">
        <Link href={href} className="btn-primary px-[32.4px] py-2.5 text-[17.5px]">
          {t.stickyCta.label}
        </Link>
        <span className="text-xs text-slate-400">{t.stickyCta.caption}</span>
      </div>
    </div>
  );
}
