"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 10000;
const HIT_RADIUS_PERCENT = 9;
const TICK_MS = 100;

type Phase = "idle" | "running" | "finished";

export function TrackingTestGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [msLeft, setMsLeft] = useState(DURATION_MS);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [percentOnTarget, setPercentOnTarget] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 50, y: 50, inside: false });
  const startRef = useRef(0);
  const hitTicksRef = useRef(0);
  const totalTicksRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function onMouseMove(e: React.MouseEvent) {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      inside: true,
    };
  }

  function onMouseLeave() {
    mouseRef.current.inside = false;
  }

  function start() {
    setPhase("running");
    setMsLeft(DURATION_MS);
    hitTicksRef.current = 0;
    totalTicksRef.current = 0;
    startRef.current = performance.now();

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startRef.current;
      if (elapsed >= DURATION_MS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMsLeft(0);
        const pct =
          totalTicksRef.current > 0 ? Math.round((hitTicksRef.current / totalTicksRef.current) * 100) : 0;
        setPercentOnTarget(pct);
        setPhase("finished");
        return;
      }
      setMsLeft(DURATION_MS - elapsed);

      const t = elapsed / 1000;
      const x = 50 + 35 * Math.sin(t * 1.3);
      const y = 50 + 35 * Math.cos(t * 0.9);
      setTargetPos({ x, y });

      totalTicksRef.current += 1;
      if (mouseRef.current.inside) {
        const dist = Math.hypot(mouseRef.current.x - x, mouseRef.current.y - y);
        if (dist < HIT_RADIUS_PERCENT) hitTicksRef.current += 1;
      }
    }, TICK_MS);
  }

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">🌀 Tracking Test</h1>
      <p className="mt-1 text-sm text-gray-500">Держи курсор на движущейся цели 10 секунд.</p>

      {phase === "running" && (
        <div className="mt-3 text-center text-sm font-medium text-gray-600">
          Осталось: {(msLeft / 1000).toFixed(1)} с
        </div>
      )}

      <div
        ref={areaRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative mt-3 h-[380px] w-full select-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
      >
        {phase === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-lg font-bold">Следи курсором за целью, не отпуская её</span>
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
            >
              Начать
            </button>
          </div>
        )}

        {phase === "running" && (
          <div
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%`, width: 36, height: 36 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient shadow-lg"
          />
        )}

        {phase === "finished" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl font-black">{percentOnTarget}%</span>
            <span className="text-sm text-gray-500">времени курсор был на цели</span>
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
