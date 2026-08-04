import Link from "next/link";

const GAMES = [
  {
    href: "/play/aim-trainer",
    title: "Aim Trainer",
    description: "Кликай по мишеням как можно быстрее — 30 секунд на раунд.",
    emoji: "🎯",
  },
  {
    href: "/play/reaction-time",
    title: "Reaction Time Test",
    description: "Проверь скорость реакции — жди сигнала и жми как можно быстрее.",
    emoji: "⚡",
  },
  {
    href: "/play/cps-test",
    title: "CPS Test",
    description: "Сколько кликов в секунду ты сможешь сделать за 5 секунд?",
    emoji: "🖱️",
  },
];

export default function PlayPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Мини-игры</h1>
      <p className="mt-1 text-sm text-gray-500">Проверь реакцию и скорость клика.</p>

      <div className="mt-6 space-y-3">
        {GAMES.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:border-brand/40"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
              {g.emoji}
            </span>
            <div className="min-w-0">
              <div className="font-bold">{g.title}</div>
              <div className="text-sm text-gray-500">{g.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
