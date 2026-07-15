import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AvatarUploadForm } from "@/components/AvatarUploadForm";
import { LogoutButton } from "@/components/LogoutButton";
import { canAccessLesson, canAccessCommunityChat, tierLabel } from "@/lib/access";

const STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает проверки",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const STATUS_CLASS: Record<string, string> = {
  approved: "border-emerald-500/40 text-emerald-400",
  rejected: "border-red-500/40 text-red-400",
  pending: "border-yellow-500/40 text-yellow-400",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/profile");

  const course = await prisma.course.findFirst({
    where: { slug: "super-code" },
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

  const allLessons = course?.modules.flatMap((m) => m.lessons) ?? [];
  const total = allLessons.length;
  const done = allLessons.filter((l) => doneSet.has(l.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const hasAccessibleLesson = allLessons.some((l) =>
    canAccessLesson({
      userTier: user.tier,
      requiredTier: l.requiredTier,
      isFree: l.isFree,
      isAdmin: user.role === "admin",
    }),
  );
  const activeCoursesCount = course && hasAccessibleLesson ? 1 : 0;

  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const registeredAt = user.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="sr-only">Профиль</h1>

        {/* Карточка профиля */}
        <div className="card">
          <div className="flex items-start gap-4">
            <AvatarUploadForm name={user.name} avatarUrl={user.avatarUrl} size="h-16 w-16" />
            <div className="min-w-0">
              <EditProfileForm name={user.name} phone={user.phone} />
              <span className="badge mt-2 inline-flex border-brand/40 text-brand-light">
                {tierLabel(user.tier)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <ProfileStat value={String(activeCoursesCount)} label="активных курсов" />
            <ProfileStat value={`${percent}%`} label="прогресс" />
            <ProfileStat value={tierLabel(user.tier)} label="подписка" />
          </div>

          <p className="mt-6 text-sm text-slate-500">В академии с {registeredAt}</p>
        </div>

        {/* Быстрый доступ */}
        <h2 className="mt-8 text-lg font-bold">Быстрый доступ</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <QuickLink href="/courses" label="Мои курсы" icon={<BookIcon />} />
          <QuickLink href="/leaderboard" label="Рейтинг" icon={<TrophyIcon />} />
          <QuickLink href="/billing" label="Подписка" icon={<CardIcon />} />
          <QuickLink href="/support" label="Чат с куратором" icon={<ChatBubbleIcon />} />
          <QuickLink
            href="/community"
            label="Чат участников"
            icon={<UsersIcon />}
            locked={!canAccessCommunityChat(user.tier, user.role === "admin")}
          />
          <QuickLink href="#payments" label="История платежей" icon={<HistoryIcon />} />
          <QuickLink href="/quiz" label="Викторина" icon={<QuizIcon />} />
          <QuickLink href="/#faq" label="FAQ" icon={<QuestionIcon />} />
        </div>

        {/* История платежей */}
        <h2 id="payments" className="mt-8 scroll-mt-24 text-lg font-bold">История платежей</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Платежей пока нет.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium">Тариф {p.tier.toUpperCase()} · {String(p.amount)} TJS</div>
                  <div className="text-xs text-slate-500">
                    {p.createdAt.toLocaleDateString("ru-RU")}
                    {p.adminComment ? ` · ${p.adminComment}` : ""}
                  </div>
                </div>
                <span className={"badge " + STATUS_CLASS[p.status]}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Выход */}
        <div className="card mt-8 border-red-500/20">
          <LogoutButton />
        </div>
      </main>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 py-3 text-center backdrop-blur-xl">
      <div className="text-lg font-bold bg-brand-gradient bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
  external,
  locked,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  locked?: boolean;
}) {
  return (
    <Link
      href={locked ? "/billing" : href}
      target={!locked && external ? "_blank" : undefined}
      rel={!locked && external ? "noopener noreferrer" : undefined}
      className={
        "card flex items-center gap-2 px-3 py-3 transition-all duration-300 hover:scale-[1.02] hover:border-brand/40 sm:gap-3 sm:px-4" +
        (locked ? " opacity-60" : "")
      }
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-light sm:h-9 sm:w-9">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium leading-tight sm:text-base">{label}</span>
      {locked && <span className="shrink-0 text-[11px] text-slate-500">🔒 Pro</span>}
    </Link>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25C10.5 5 8 4.5 4.5 5v13c3.5-.5 6 0 7.5 1.25M12 6.25C13.5 5 16 4.5 19.5 5v13c-3.5-.5-6 0-7.5 1.25M12 6.25v13" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H5a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3M16 5h3a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v3m-3 3h6m-3 0v-3" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M3 10h18" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a2.5 2.5 0 1 1 0-5M16 13.5c2.5.3 4.5 2.5 4.5 5.5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2 2 4-4.5" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7v.3" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
