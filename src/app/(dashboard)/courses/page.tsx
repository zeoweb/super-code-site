import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/Reveal";
import { canAccessLesson, requiredTierLabel } from "@/lib/access";

// Выбор курса: сначала пользователь выбирает курс, затем переходит
// на его первый бесплатный урок (доступ к платным урокам — через /billing).
export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/courses");

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { lessonId: true },
  });
  const doneSet = new Set(progress.map((p) => p.lessonId));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Reveal>
        <span className="badge border-brand/40 text-brand-light">Обучение</span>
        <h1 className="mt-2 text-2xl font-bold">Курсы</h1>
        <p className="mt-1 text-slate-400">Выберите курс — первый урок всегда бесплатный.</p>
      </Reveal>

      <div className="mt-6 space-y-4">
        {courses.map((course, i) => {
          const lessons = course.modules.flatMap((m) => m.lessons);
          const firstFree = lessons.find((l) => l.isFree);
          const total = lessons.length;
          const done = lessons.filter((l) => doneSet.has(l.id)).length;
          const percent = total ? Math.round((done / total) * 100) : 0;

          return (
            <div key={course.id} className="space-y-4">
              <Reveal delay={i * 0.05}>
                <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold">{course.title}</h2>
                    {course.description && (
                      <p className="mt-1 text-sm text-slate-400">{course.description}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      {course.modules.length} модуля · {total} уроков
                      {done > 0 ? ` · ${percent}% пройдено` : ""}
                    </p>
                  </div>
                  {firstFree ? (
                    <Link href={`/lessons/${firstFree.id}`} className="btn-primary w-full shrink-0 text-center sm:w-auto">
                      Начать бесплатный урок →
                    </Link>
                  ) : (
                    <span className="badge shrink-0 text-slate-500">Скоро</span>
                  )}
                </div>
              </Reveal>

              {/* Программа курса: все модули и уроки */}
              <div className="space-y-4">
                {course.modules.map((m, mi) => (
                  <Reveal key={m.id} delay={i * 0.05 + mi * 0.05}>
                    <section className="card">
                      <h3 className="font-semibold">{m.title}</h3>
                      <ul className="mt-3 divide-y divide-white/10">
                        {m.lessons.map((l) => {
                          const isDone = doneSet.has(l.id);
                          const canOpen = canAccessLesson({
                            userTier: user.tier,
                            requiredTier: l.requiredTier,
                            isFree: l.isFree,
                            isAdmin: user.role === "admin",
                          });
                          return (
                            <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className={isDone ? "shrink-0 text-brand-light" : "shrink-0 text-slate-500"}>
                                    {isDone ? "✓" : "○"}
                                  </span>
                                  <span className="min-w-0 truncate">{l.title}</span>
                                </div>
                                {!canOpen && (
                                  <span className="ml-6 text-xs text-slate-500">
                                    Доступно на тарифе {requiredTierLabel(l.requiredTier)}
                                  </span>
                                )}
                              </div>
                              {canOpen ? (
                                <Link href={`/lessons/${l.id}`} className="btn-primary shrink-0 px-4 py-2 text-sm">
                                  Смотреть
                                </Link>
                              ) : (
                                <Link href="/billing" className="btn-ghost shrink-0 px-4 py-2 text-sm">
                                  🔒 Купить
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}

        {courses.length === 0 && (
          <p className="text-center text-sm text-slate-500">Курсы скоро появятся.</p>
        )}
      </div>
    </main>
  );
}
