"use client";

import { useEffect, useRef, useState } from "react";

const ATTEMPTS_TOTAL = 5;
const MIN_DELAY = 1000;
const MAX_DELAY = 4000;

type Phase = "idle" | "waiting" | "ready" | "tooSoon" | "result" | "finished";

export function ReactionTimeGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [attempts, setAttempts] = useState<number[]>([]);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const readyAtRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function beginAttempt() {
    setPhase("waiting");
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase("ready");
    }, delay);
  }

  function onAreaClick() {
    if (phase === "idle") {
      setAttempts([]);
      beginAttempt();
      return;
    }
    if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("tooSoon");
      return;
    }
    if (phase === "tooSoon") {
      beginAttempt();
      return;
    }
    if (phase === "ready") {
      const rt = Math.round(performance.now() - readyAtRef.current);
      setLastResult(rt);
      const next = [...attempts, rt];
      setAttempts(next);
      setPhase(next.length >= ATTEMPTS_TOTAL ? "finished" : "result");
      return;
    }
    if (phase === "result") {
      beginAttempt();
      return;
    }
    if (phase === "finished") {
      setAttempts([]);
      beginAttempt();
    }
  }

  const avg = attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : 0;

  const style =
    phase === "ready"
      ? "bg-emerald-500 text-white"
      : phase === "waiting"
        ? "bg-gray-800 text-white"
        : phase === "tooSoon"
          ? "bg-red-500 text-white"
          : "bg-gray-100 text-gray-900";

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">⚡ Reaction Time Test</h1>
      <p className="mt-1 text-sm text-gray-500">
        Попытка {Math.min(attempts.length + (phase === "finished" ? 0 : 1), ATTEMPTS_TOTAL)} из {ATTEMPTS_TOTAL}
      </p>

      <button
        type="button"
        onClick={onAreaClick}
        className={`mt-4 flex h-[320px] w-full flex-col items-center justify-center gap-3 rounded-2xl text-center transition-colors duration-150 ${style}`}
      >
        {phase === "idle" && (
          <>
            <span className="text-lg font-bold">Проверь скорость реакции</span>
            <span className="text-sm opacity-70">Нажми, чтобы начать</span>
          </>
        )}
        {phase === "waiting" && <span className="text-xl font-bold">Жди...</span>}
        {phase === "ready" && <span className="text-2xl font-black">Жми!</span>}
        {phase === "tooSoon" && (
          <>
            <span className="text-xl font-bold">Слишком рано!</span>
            <span className="text-sm opacity-80">Нажми, чтобы попробовать снова</span>
          </>
        )}
        {phase === "result" && lastResult !== null && (
          <>
            <span className="text-3xl font-black">{lastResult} мс</span>
            <span className="text-sm text-gray-500">Нажми для следующей попытки</span>
          </>
        )}
        {phase === "finished" && (
          <>
            <span className="text-3xl font-black">{avg} мс</span>
            <span className="text-sm text-gray-500">среднее время · нажми, чтобы попробовать снова</span>
          </>
        )}
      </button>

      {attempts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {attempts.map((a, i) => (
            <span key={i} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
              {i + 1}: {a} мс
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
