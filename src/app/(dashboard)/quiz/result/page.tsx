import Link from "next/link";
import { QUIZ_XP } from "@/lib/gamification";
import { quizDifficultyLabel } from "@/lib/access";
import type { QuizDifficulty } from "@prisma/client";

const VALID_DIFFICULTIES: QuizDifficulty[] = ["novice", "medium", "pro"];

export default function QuizResultPage({
  searchParams,
}: {
  searchParams: { score?: string; total?: string; difficulty?: string; awarded?: string };
}) {
  const score = Number(searchParams.score ?? 0);
  const total = Number(searchParams.total ?? 0);
  const awarded = searchParams.awarded === "1";
  const percent = total ? Math.round((score / total) * 100) : 0;
  const difficulty = VALID_DIFFICULTIES.includes(searchParams.difficulty as QuizDifficulty)
    ? (searchParams.difficulty as QuizDifficulty)
    : null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="card text-center shadow-glow-lg border-brand/40">
        <div className="text-4xl">{percent >= 70 ? "🎉" : "📚"}</div>
        {difficulty && (
          <span className="badge mt-2 border-brand/40 text-brand-light">{quizDifficultyLabel(difficulty)}</span>
        )}
        <h1 className="mt-2 text-xl font-bold">
          {score} из {total} правильных ({percent}%)
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {awarded
            ? `Начислено +${QUIZ_XP} XP за первое прохождение этого уровня.`
            : "XP за этот уровень уже был начислен раньше — за повторные попытки очки не дублируются."}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={difficulty ? `/quiz/play?difficulty=${difficulty}` : "/quiz"}
            className="btn-primary flex-1 text-center"
          >
            Пройти ещё раз
          </Link>
          <Link href="/quiz" className="btn-ghost flex-1 text-center">Сменить уровень</Link>
          <Link href="/leaderboard" className="btn-ghost flex-1 text-center">Рейтинг</Link>
        </div>
      </div>
    </main>
  );
}
