import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";
import { getLevelFromXP } from "@/lib/gamification";

const TOP_LIMIT = 50;
const MEDALS = ["🥇", "🥈", "🥉"];

// Лидерборд: топ учеников по XP + позиция текущего пользователя.
// Приватность: из других пользователей наружу идут только имя и XP —
// ни email, ни телефон здесь не запрашиваются и не показываются.
export default async function LeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?returnTo=/leaderboard");

  const topUsers = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: TOP_LIMIT,
    select: { id: true, name: true, xp: true, avatarUrl: true },
  });

  const higherCount = await prisma.user.count({ where: { xp: { gt: user.xp } } });
  const myRank = higherCount + 1;
  const myLevel = getLevelFromXP(user.xp);
  const progressPercent =
    myLevel.xpForNextLevel > 0
      ? Math.round((myLevel.xpIntoLevel / myLevel.xpForNextLevel) * 100)
      : 100;

  return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Лидерборд</h1>
        <p className="mt-1 text-slate-400">
          Сравнивайте прогресс с другими учениками Super Code
        </p>

        {/* Ваша позиция */}
        <Reveal>
          <div className="card mt-6 border-brand/40 shadow-glow">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="h-14 w-14" textSize="text-xl" />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-slate-400">Ваша позиция</div>
                <div className="text-2xl font-bold">#{myRank}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span className="badge border-brand/40 text-brand-light">Уровень {myLevel.level}</span>
                  <span>{myLevel.xpToNext} XP до следующего уровня</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-2xl font-black bg-brand-gradient bg-clip-text text-transparent">
                  {user.xp}
                </div>
                <div className="text-xs text-slate-400">XP</div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-900/80">
              <div
                className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Reveal>

        {/* Топ учеников */}
        <h2 className="mt-8 text-lg font-bold">Топ учеников</h2>
        <div className="mt-3 space-y-2">
          {topUsers.map((u, i) => {
            const rank = i + 1;
            const level = getLevelFromXP(u.xp);
            const isMe = u.id === user.id;
            return (
              <Reveal key={u.id} delay={Math.min(i * 0.02, 0.6)}>
                <div className={"card flex items-center gap-4 py-3" + (isMe ? " border-brand/40" : "")}>
                  <span className="w-8 shrink-0 text-center text-lg font-bold text-slate-400">
                    {rank <= 3 ? MEDALS[rank - 1] : rank}
                  </span>
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {u.name}
                      {isMe && <span className="ml-2 text-xs text-brand-light">(вы)</span>}
                    </div>
                    <div className="text-xs text-slate-400">Уровень {level.level}</div>
                  </div>
                  <div className="shrink-0 text-lg font-bold text-brand-light">{u.xp} XP</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </main>
  );
}
