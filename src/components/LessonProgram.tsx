import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { canAccessLesson } from "@/lib/access";
import type { Tier, RequiredTier } from "@prisma/client";

type ProgramLesson = { id: string; title: string; isFree: boolean; requiredTier: RequiredTier };
type ProgramModule = { id: string; title: string; lessons: ProgramLesson[] };
type ProgramCourse = { title: string; modules: ProgramModule[] };

// Программа курса: используется и в десктопном сайдбаре урока, и в
// раскрывающемся блоке "Программа" на мобильных — контент один и тот же.
export function LessonProgram({
  course,
  currentLessonId,
  doneSet,
  userTier,
  isAdmin,
}: {
  course: ProgramCourse;
  currentLessonId: string;
  doneSet: Set<string>;
  userTier: Tier;
  isAdmin: boolean;
}) {
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={course.title} size="h-10 w-10" textSize="text-sm" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{course.title}</div>
          <div className="text-xs text-slate-500">{totalLessons} уроков</div>
        </div>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {course.modules.map((m) => (
          <div key={m.id}>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.title}</div>
            <div className="mt-2 space-y-1">
              {m.lessons.map((l) => {
                const isCurrent = l.id === currentLessonId;
                const isDone = doneSet.has(l.id);
                const canOpen = canAccessLesson({
                  userTier,
                  requiredTier: l.requiredTier,
                  isFree: l.isFree,
                  isAdmin,
                });
                return (
                  <Link
                    key={l.id}
                    href={canOpen ? `/lessons/${l.id}` : "/billing"}
                    className={
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-300 " +
                      (isCurrent
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "text-slate-300 hover:bg-white/10")
                    }
                  >
                    <span className="shrink-0">{!canOpen ? "🔒" : isDone ? "✓" : "○"}</span>
                    <span className="truncate">{l.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
