"use client";

import { useRef, useState } from "react";

const ROUNDS_TOTAL = 6;
const TARGET_SIZE = 46; // px
const MIN_JUMP_PERCENT = 35; // минимальный "перескок" между целями — иначе это не флик, а доводка

type Phase = "idle" | "playing" | "finished";
type Target = { x: number; y: number };

function randomTarget(prev: Target | null): Target {
  let next: Target;
  do {
    next = { x: 8 + Math.random() * 84, y: 8 + Math.random() * 84 };
  } while (prev && Math.hypot(next.x - prev.x, next.y - prev.y) < MIN_JUMP_PERCENT);
  return next;
}

export function FlickShotGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<Target | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const spawnRef = useRef(0);
  const targetRef = useRef<Target | null>(null);

  function spawn(prevTarget: Target | null) {
    const t = randomTarget(prevTarget);
    targetRef.current = t;
    setTarget(t);
    spawnRef.current = performance.now();
  }

  function start() {
    setPhase("playing");
    setRound(1);
    setHits(0);
    setMisses(0);
    setTimes([]);
    spawn(null);
  }

  function onHit(e: React.MouseEvent) {
    e.stopPropagation();
    if (phase !== "playing") return;
    const ms = performance.now() - spawnRef.current;
    setTimes((t) => [...t, ms]);
    setHits((h) => h + 1);

    if (round >= ROUNDS_TOTAL) {
      setPhase("finished");
      setTarget(null);
      return;
    }
    setRound((r) => r + 1);
    spawn(targetRef.current);
  }

  function onMiss() {
    if (phase !== "playing") return;
    setMisses((m) => m + 1);
  }

  const avgMs = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const totalClicks = hits + misses;
  const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">🏹 Flick Shot Trainer</h1>
      <p className="mt-1 text-sm text-gray-500">Резко наводись на цель — {ROUNDS_TOTAL} раундов подряд.</p>

      {phase === "playing" && (
        <div className="mt-3 text-center text-sm font-medium text-gray-600">
          Раунд {round} из {ROUNDS_TOTAL}
        </div>
      )}

      <div
        onClick={onMiss}
        className="relative mt-3 h-[380px] w-full select-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
      >
        {phase === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-lg font-bold">Проверь скорость и точность резкого наведения</span>
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
            style={{ left: `${target.x}%`, top: `${target.y}%`, width: TARGET_SIZE, height: TARGET_SIZE }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient shadow-lg"
            aria-label="Цель"
          />
        )}

        {phase === "finished" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl font-black">{avgMs} мс</span>
            <span className="text-sm text-gray-500">среднее время флика · точность {accuracy}%</span>
          </div>
        )}
      </div>

      {phase === "finished" && (
        <button
          type="button"
          onClick={start}
          className="mt-4 w-full rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
        >
          Ещё раз
        </button>
      )}
    </div>
  );
}
