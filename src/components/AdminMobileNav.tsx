"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

// Мобильная навигация админки: гамбургер открывает выезжающую шторку с тем
// же AdminSidebar, что и на десктопе (там слишком много разделов для таб-бара).
export function AdminMobileNav({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Меню админки"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors duration-300 hover:bg-white/10 md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Портал в body: хедер использует backdrop-blur, а backdrop-filter
          создаёт containing block для position:fixed — без портала шторка
          сжималась бы в границы хедера вместо всего экрана. */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-full w-[85%] max-w-xs flex-col overflow-y-auto border-r border-white/10 bg-ink-900 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold text-slate-400">Меню админки</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  className="rounded-full p-1.5 text-slate-400 transition-colors duration-300 hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <AdminSidebar name={name} avatarUrl={avatarUrl} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
