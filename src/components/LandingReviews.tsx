"use client";

import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { ReviewsCarousel, type ReviewItem } from "@/components/ReviewsCarousel";
import { useLanguage } from "@/components/LanguageProvider";

// dbReviews — реальные отзывы из админки (могут быть пустыми). Если их нет,
// показываем демо-заглушки на текущем языке интерфейса.
export function LandingReviews({ dbReviews }: { dbReviews: ReviewItem[] }) {
  const { t } = useLanguage();

  const reviews: ReviewItem[] =
    dbReviews.length > 0
      ? dbReviews
      : t.reviews.fallback.map((r) => ({
          id: r.id,
          studentName: r.studentName,
          studentRole: r.studentRole,
          quoteText: r.quoteText,
          rating: r.rating,
          videoUrl: null,
        }));

  return (
    <section id="reviews" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-16">
      <Reveal>
        <div className="text-center">
          <span className="badge border-brand/40 text-brand-light">{t.reviews.badge}</span>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t.reviews.heading}</h2>
          <p className="mt-2 text-slate-400">{t.reviews.subtitle}</p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-4">
          <Stat value="15+" label={t.reviews.statStudents} />
          <Stat value="4.9" label={t.reviews.statRating} />
          <Stat value="82%" label={t.reviews.statTryFree} />
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10">
          <ReviewsCarousel reviews={reviews} />
        </div>
      </Reveal>
    </section>
  );
}
