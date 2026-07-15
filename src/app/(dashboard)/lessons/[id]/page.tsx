import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CompleteButton } from "@/components/CompleteButton";
import { LessonProgram } from "@/components/LessonProgram";
import { MobileProgramToggle } from "@/components/MobileProgramToggle";
import { NextLessonButton } from "@/components/NextLessonButton";
import { LessonAiChat } from "@/components/LessonAiChat";
import { canAccessLesson, requiredTierLabel } from "@/lib/access";
import { signBunnyEmbed } from "@/lib/bunny";

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} мин`;
}

// Страница урока с защищённым Bunny-плеером.
// Токенизированная ссылка генерируется на сервере при каждом запросе (короткий TTL).
// Первый бесплатный урок открыт и без входа — авторизация нужна только для
// действий (прогресс, «Далее», AI-чат, куратор): для анонимных они ведут на регистрацию.
export default async function LessonPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const registerHref = `/register?returnTo=${encodeURIComponent(`/lessons/${params.id}`)}`;

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { orderIndex: "asc" },
                include: { lessons: { orderBy: { orderIndex: "asc" } } },
              },
            },
          },
        },
      },
    },
  });
  if (!lesson) notFound();

  const course = lesson.module.course;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const progress = user
    ? await prisma.lessonProgress.findMany({
        where: { userId: user.id, lessonId: { in: allLessons.map((l) => l.id) }, completed: true },
        select: { lessonId: true },
      })
    : [];
  const doneSet = new Set(progress.map((p) => p.lessonId));

  const isAdmin = user?.role === "admin";
  const userTier = user?.tier ?? "none";
  const allowed = canAccessLesson({
    userTier,
    requiredTier: lesson.requiredTier,
    isFree: lesson.isFree,
    isAdmin,
  });

  const total = allLessons.length;
  const done = allLessons.filter((l) => doneSet.has(l.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const nextLessonLocked = nextLesson
    ? !canAccessLesson({
        userTier,
        requiredTier: nextLesson.requiredTier,
        isFree: nextLesson.isFree,
        isAdmin,
      })
    : false;

  const programList = (
    <LessonProgram
      course={course}
      currentLessonId={lesson.id}
      doneSet={doneSet}
      userTier={userTier}
      isAdmin={isAdmin}
    />
  );

  // Если доступа нет — показываем замок, но не палим видео.
  if (!allowed) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/courses" className="text-sm text-slate-400 hover:text-white">← К курсу</Link>
        <div className="card mt-4 text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-3 text-xl font-bold">{lesson.title}</h1>
          <p className="mt-2 text-slate-400">
            Этот урок доступен на тарифе {requiredTierLabel(lesson.requiredTier)}.
          </p>
          <Link href="/billing" className="btn-primary mt-4">Купить доступ</Link>
        </div>
      </main>
    );
  }

  const embed = signBunnyEmbed(lesson.bunnyVideoId);
  const durationLabel = lesson.durationSeconds ? formatDuration(lesson.durationSeconds) : null;

  const lessonAiHistory = user
    ? await prisma.aiChatMessage.findMany({
        where: { lessonId: lesson.id, userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      })
    : [];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Link href="/courses" className="text-sm text-slate-400 hover:text-white">← К курсу</Link>

      {!user && (
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 border-brand/30 bg-brand/[0.06]">
          <div>
            <p className="font-semibold">🎓 Вы смотрите бесплатный урок без регистрации</p>
            <p className="mt-1 text-sm text-slate-400">
              Зарегистрируйтесь, чтобы сохранить прогресс, открыть следующие уроки и спросить AI-помощника.
            </p>
          </div>
          <Link href={registerHref} className="btn-primary shrink-0">Зарегистрироваться →</Link>
        </div>
      )}

      {/* Прогресс по курсу целиком */}
      <div className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-ink-900/80">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Урок {currentIndex + 1} из {total} · {percent}% курса пройдено
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Видео-плеер */}
          <div className="card overflow-hidden p-0">
            <div className="relative aspect-video bg-gradient-to-br from-ink-700 to-ink-900">
              {embed ? (
                <iframe
                  src={embed.url}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-2xl text-white shadow-glow">
                    ▶
                  </span>
                  <p className="text-sm text-slate-500">
                    Видео ещё не загружено. Добавьте его в админке (поле «Видео Bunny»)
                    или настройте переменные BUNNY_* в .env.
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {lesson.title}
            {durationLabel ? ` · ${durationLabel}` : ""} · Защищённый поток
          </p>

          {/* Инфо об уроке */}
          <div className="card mt-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge border-white/10 text-slate-300">{lesson.module.title}</span>
              {durationLabel && <span className="badge border-white/10 text-slate-300">{durationLabel}</span>}
            </div>
            <h1 className="mt-3 text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="mt-2 whitespace-pre-line text-slate-300">{lesson.description}</p>
            )}
          </div>

          {/* Действия */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {prevLesson && (
              <Link href={`/lessons/${prevLesson.id}`} className="btn-ghost">← Назад</Link>
            )}
            {user ? (
              <>
                <CompleteButton lessonId={lesson.id} initialCompleted={doneSet.has(lesson.id)} />
                {nextLesson && (
                  <NextLessonButton
                    nextLessonId={nextLesson.id}
                    locked={nextLessonLocked}
                    requiredLabel={requiredTierLabel(nextLesson.requiredTier)}
                  />
                )}
                <MobileProgramToggle>{programList}</MobileProgramToggle>
                <Link href="/support" className="btn-ghost">💬 Куратор</Link>
              </>
            ) : (
              <>
                {nextLesson && (
                  <Link href={registerHref} className="btn-primary">Далее → Зарегистрироваться</Link>
                )}
                <Link href={registerHref} className="btn-ghost">✓ Отметить пройденным</Link>
                <MobileProgramToggle>{programList}</MobileProgramToggle>
                <Link href={registerHref} className="btn-ghost">💬 Куратор</Link>
              </>
            )}
          </div>

          {/* AI-помощник по этому уроку */}
          <div className="mt-4">
            {user ? (
              <LessonAiChat
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                initialMessages={lessonAiHistory.map((m) => ({
                  role: m.role as "user" | "assistant",
                  content: m.content,
                }))}
              />
            ) : (
              <Link
                href={registerHref}
                className="card flex items-center gap-3 border-indigo-500/20 bg-indigo-500/[0.04] transition-colors duration-300 hover:bg-indigo-500/[0.08]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-lg text-white shadow-lg">
                  ✨
                </span>
                <div className="min-w-0">
                  <div className="font-bold">AI по уроку</div>
                  <div className="text-sm text-slate-400">Зарегистрируйтесь, чтобы задать вопрос →</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Программа курса — всегда видна на десктопе */}
        <aside className="hidden lg:block">{programList}</aside>
      </div>
    </main>
  );
}
