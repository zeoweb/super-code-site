import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/Reveal";
import { Stat } from "@/components/Stat";
import { Avatar } from "@/components/Avatar";
import { ActivityCard } from "@/components/ActivityCard";
import { canAccessLesson, tierLabel } from "@/lib/access";
import { getLevelFromXP } from "@/lib/gamification";

// Личный кабинет: обзор прогресса, XP и топ учеников. Список модулей/уроков — на /courses.
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/dashboard");

  const course = await prisma.course.findFirst({
    where: { slug: "super-code" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  // Прогресс пользователя: множество id завершённых уроков
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { lessonId: true },
  });
  const doneSet = new Set(progress.map((p) => p.lessonId));

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const total = allLessons.length;
  const done = allLessons.filter((l) => doneSet.has(l.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const accessibleLessons = allLessons.filter((l) =>
    canAccessLesson({
      userTier: user.tier,
      requiredTier: l.requiredTier,
      isFree: l.isFree,
      isAdmin: user.role === "admin",
    }),
  );
  const activeCoursesCount = course && accessibleLessons.length > 0 ? 1 : 0;

  const nextLesson = accessibleLessons.find((l) => !doneSet.has(l.id)) ?? accessibleLessons[0];
  const ctaHref = nextLesson ? `/lessons/${nextLesson.id}` : "/billing";
  const ctaLabel = done === 0 ? "Начать первый урок →" : "Продолжить обучение →";

  const level = getLevelFromXP(user.xp);
  const levelPercent =
    level.xpForNextLevel > 0 ? Math.round((level.xpIntoLevel / level.xpForNextLevel) * 100) : 100;

  const higherCount = await prisma.user.count({ where: { xp: { gt: user.xp } } });
  const myRank = higherCount + 1;

  const topUsers = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: 3,
    select: { id: true, name: true, xp: true, avatarUrl: true },
  });

  const recentNotifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, message: true, createdAt: true },
  });

  const hasQuizAttempt = (await prisma.quizAttempt.count({ where: { userId: user.id } })) > 0;

  return (
    <main className="relative mx-auto max-w-4xl overflow-hidden p-6 pt-10">
      <div className="pointer-events-none absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

      {/* Hero */}
      <Reveal>
        <div className="card bg-gradient-to-br from-white/[0.07] to-white/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="badge border-brand/40 text-brand-light">Личный кабинет</span>
              <h1 className="mt-2 text-2xl font-bold">Привет, {user.name}!</h1>
              <p className="mt-1 max-w-md text-slate-400">
                Продолжайте проходить уроки и поднимайтесь в рейтинге учеников.
              </p>
            </div>
            <Link href={ctaHref} className="btn-primary shrink-0 px-6 py-3">
              {ctaLabel}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge border-white/10 text-slate-300">
              Ур. {level.level} · {tierLabel(user.tier)}
            </span>
            <span className="badge border-white/10 text-slate-300">⭐ {user.xp} XP</span>
            <span className="badge border-white/10 text-slate-300" title="Серии дней пока не реализованы">
              🔥 0 дн.
            </span>
            <span className="badge border-white/10 text-slate-300">🏆 #{myRank} в рейтинге</span>
          </div>
        </div>
      </Reveal>

      {/* Стат-плашки */}
      <Reveal delay={0.05}>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value={String(activeCoursesCount)} label="Курсов" />
          <Stat value={`${percent}%`} label="Ср. прогресс" />
          <Stat value="0 дн." label="Серия" />
        </div>
      </Reveal>

      {/* До следующего уровня */}
      <Reveal delay={0.1}>
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">⭐ До следующего уровня</span>
            <span className="font-bold text-brand-light">{levelPercent}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink-900/80">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {level.xpToNext} XP до апгрейда · {user.xp} XP всего
          </p>
        </div>
      </Reveal>

      {/* Топ учеников */}
      <Reveal delay={0.15}>
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold">🏆 Топ учеников</span>
            <Link href="/leaderboard" className="text-sm text-brand-light hover:underline">Все</Link>
          </div>
          <div className="mt-3 space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-sm text-slate-400">{i + 1}</span>
                <Avatar name={u.name} avatarUrl={u.avatarUrl} size="h-8 w-8" textSize="text-sm" />
                <span className="flex-1 truncate text-sm">{u.name}</span>
                <span className="shrink-0 text-sm font-bold text-brand-light">{u.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Призыв пройти викторину */}
      <Reveal delay={0.2}>
        <div className="card mt-4 bg-gradient-to-br from-brand/10 to-transparent">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-semibold">🎯 Проверьте себя</span>
              <p className="mt-1 max-w-sm text-sm text-slate-400">
                10 случайных вопросов по программированию · +20 XP за первое прохождение уровня.
              </p>
            </div>
            <Link href="/quiz" className="btn-primary shrink-0">
              {hasQuizAttempt ? "Пройти ещё раз →" : "Пройти викторину →"}
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Активность — самый низ раздела Меню */}
      <Reveal delay={0.25}>
        <ActivityCard
          notifications={recentNotifications.map((n) => ({
            id: n.id,
            message: n.message,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </Reveal>
    </main>
  );
}
