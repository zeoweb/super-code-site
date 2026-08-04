"use client";

import { useEffect, useRef, useState } from "react";

const ROUND_SECONDS = 30;
const TARGET_SIZE = 44; // px

type Phase = "idle" | "playing" | "finished";
type Target = { x: number; y: number };

export function AimTrainerGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [target, setTarget] = useState<Target | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactions, setReactions] = useState<number[]>([]);
  const spawnTimeRef = useRef(0);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("finished");
          setTarget(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function spawnTarget() {
    setTarget({ x: 5 + Math.random() * 85, y: 5 + Math.random() * 85 });
    spawnTimeRef.current = performance.now();
  }

  function start() {
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setHits(0);
    setMisses(0);
    setReactions([]);
    spawnTarget();
  }

  function onHit(e: React.MouseEvent) {
    e.stopPropagation();
    if (phase !== "playing") return;
    setReactions((r) => [...r, performance.now() - spawnTimeRef.current]);
    setHits((h) => h + 1);
    spawnTarget();
  }

  function onMiss() {
    if (phase !== "playing") return;
    setMisses((m) => m + 1);
  }

  const total = hits + misses;
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;
  const avgReaction = reactions.length
    ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
    : 0;

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">🎯 Aim Trainer</h1>

      {phase === "playing" && (
        <div className="mt-3 flex items-center gap-4 text-sm font-medium text-gray-600">
          <span>Время: {timeLeft} с</span>
          <span>Попадания: {hits}</span>
          <span>Промахи: {misses}</span>
        </div>
      )}

      <div
        onClick={onMiss}
        className="relative mt-4 h-[420px] w-full select-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
      >
        {phase === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-sm text-gray-500">30 секунд, кликай по мишеням как можно быстрее.</p>
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
            >
              Начать
            </button>
          </div>
        )}

        {phase === "playing" && target && (
          <button
            type="button"
            onClick={onHit}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: TARGET_SIZE,
              height: TARGET_SIZE,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient shadow-lg transition-transform duration-150 hover:scale-105"
            aria-label="Мишень"
          />
        )}

        {phase === "finished" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div>
              <div className="text-3xl font-black">{hits}</div>
              <div className="text-sm text-gray-500">попаданий</div>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <span>Промахи: {misses}</span>
              <span>Точность: {accuracy}%</span>
              <span>Средняя реакция: {avgReaction} мс</span>
            </div>
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
            >
              Играть снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
