"use client";

import { useEffect, useRef, useState } from "react";

const GRID_SIZE = 5; // 5x5 = 25 ячеек
const ROUND_SECONDS = 20;

type Phase = "idle" | "playing" | "finished";

export function GridShotGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const prevCellRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("finished");
          setActiveCell(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function spawnCell(prev: number | null) {
    let next: number;
    do {
      next = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    } while (next === prev);
    prevCellRef.current = next;
    setActiveCell(next);
  }

  function start() {
    setPhase("playing");
    setTimeLeft(ROUND_SECONDS);
    setHits(0);
    setMisses(0);
    spawnCell(null);
  }

  function onCellClick(i: number) {
    if (phase !== "playing") return;
    if (i === activeCell) {
      setHits((h) => h + 1);
      spawnCell(prevCellRef.current);
    } else {
      setMisses((m) => m + 1);
    }
  }

  const totalClicks = hits + misses;
  const accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0;

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">🔲 Grid Shot</h1>
      <p className="mt-1 text-sm text-gray-500">
        Кликай по подсвеченной ячейке как можно быстрее — {ROUND_SECONDS} секунд.
      </p>

      {phase === "playing" && (
        <div className="mt-3 flex items-center justify-center gap-4 text-sm font-medium text-gray-600">
          <span>Время: {timeLeft} с</span>
          <span>Попадания: {hits}</span>
        </div>
      )}

      <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {phase === "idle" && (
          <div className="flex h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-lg font-bold">Кликай по подсвеченным ячейкам</span>
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
            >
              Начать
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onCellClick(i)}
                className={`aspect-square rounded-lg transition-colors duration-100 ${
                  i === activeCell
                    ? "bg-brand-gradient shadow-lg"
                    : "border border-gray-200 bg-white hover:bg-gray-100"
                }`}
                aria-label={i === activeCell ? "Цель" : "Ячейка"}
              />
            ))}
          </div>
        )}

        {phase === "finished" && (
          <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl font-black">{hits}</span>
            <span className="text-sm text-gray-500">попаданий · точность {accuracy}%</span>
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
