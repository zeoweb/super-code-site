import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingHero } from "@/components/LandingHero";
import { LandingReviews } from "@/components/LandingReviews";
import { LandingWhy } from "@/components/LandingWhy";
import { LandingStartToday } from "@/components/LandingStartToday";
import { LandingFaq } from "@/components/LandingFaq";
import { LandingFooter } from "@/components/LandingFooter";
import { StickyCta } from "@/components/StickyCta";
import type { ReviewItem } from "@/components/ReviewsCarousel";

// Лендинг курса. Публичный — виден без входа.
export default async function LandingPage() {
  const session = await getSession();

  const course = await prisma.course.findFirst({
    where: { slug: "super-code" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  const lessonsCount = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  const firstFreeLesson = course?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isFree);
  const watchHref = firstFreeLesson ? `/lessons/${firstFreeLesson.id}` : "/register";

  const publishedReviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: "asc" },
  });
  const dbReviews: ReviewItem[] = publishedReviews.map((r) => ({
    id: r.id,
    studentName: r.studentName,
    studentRole: r.studentRole,
    quoteText: r.quoteText,
    videoUrl: r.videoUrl,
    rating: r.rating,
  }));

  return (
    <LanguageProvider>
      <main className="relative overflow-x-clip pb-24">
        <LandingHeader isLoggedIn={!!session} watchHref={watchHref} />
        <LandingHero
          watchHref={watchHref}
          modulesCount={course?.modules.length ?? 0}
          lessonsCount={lessonsCount}
        />
        <LandingReviews dbReviews={dbReviews} />
        <LandingWhy />
        <LandingStartToday watchHref={watchHref} />
        <LandingFaq />
        <LandingFooter />
        <StickyCta href={watchHref} />
      </main>
    </LanguageProvider>
  );
}
