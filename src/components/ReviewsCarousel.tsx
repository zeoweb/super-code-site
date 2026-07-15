"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export type ReviewItem = {
  id: string;
  studentName: string;
  studentRole?: string | null;
  quoteText?: string | null;
  videoUrl?: string | null;
  rating: number;
};

const GRADIENTS = [
  "from-blue-600/40 to-cyan-400/20",
  "from-cyan-500/30 to-blue-700/30",
  "from-blue-500/30 to-indigo-500/20",
  "from-sky-500/30 to-blue-600/20",
];

export function ReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  function scrollToIndex(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  function next() {
    scrollToIndex((active + 1) % reviews.length);
  }
  function prev() {
    scrollToIndex((active - 1 + reviews.length) % reviews.length);
  }

  // Автопрокрутка каждые 4.5с, с паузой при взаимодействии.
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) next();
    }, 4500);
    return () => clearInterval(id);
  });

  // Следим за скроллом, чтобы обновлять активную точку.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!track) return;
        const cards = Array.from(track.children) as HTMLElement[];
        let closest = 0;
        let min = Infinity;
        cards.forEach((c, i) => {
          const d = Math.abs(c.offsetLeft - track.offsetLeft - track.scrollLeft);
          if (d < min) {
            min = d;
            closest = i;
          }
        });
        setActive(closest);
      });
    }
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <div
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onTouchStart={() => (pausedRef.current = true)}
    >
      <div className="relative">
        <button
          onClick={prev}
          aria-label={t.reviews.ariaPrev}
          className="absolute left-0 top-1/2 z-10 -translate-x-2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white/10 sm:-translate-x-4"
        >
          ←
        </button>
        <button
          onClick={next}
          aria-label={t.reviews.ariaNext}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white/10 sm:translate-x-4"
        >
          →
        </button>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-8 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className={`card relative aspect-[9/16] w-40 shrink-0 snap-center overflow-hidden bg-gradient-to-br p-0 sm:w-52 ${GRADIENTS[i % GRADIENTS.length]}`}
            >
              {/* Плейсхолдер видео / play-кнопка */}
              <div className="flex h-full flex-col justify-between p-3">
                <div className="flex justify-end">
                  <span className="text-xs">{"★".repeat(r.rating)}</span>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-xl transition-transform duration-300 group-hover:scale-110">
                    ▶
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.studentName}</div>
                  {r.studentRole && <div className="text-xs text-slate-300">{r.studentRole}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Точки-индикаторы */}
      <div className="mt-4 flex justify-center gap-2">
        {reviews.map((_, i) => (
          <button
            key={i}
            aria-label={`${t.reviews.ariaDotPrefix} ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-brand-gradient" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Текстовая цитата активного отзыва */}
      {reviews[active]?.quoteText && (
        <p className="mx-auto mt-6 max-w-xl text-center text-slate-300">
          "{reviews[active].quoteText}"
        </p>
      )}
    </div>
  );
}
