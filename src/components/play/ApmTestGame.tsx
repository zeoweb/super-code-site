"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 60000;

type Phase = "idle" | "running" | "finished";

export function ApmTestGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [actions, setActions] = useState(0);
  const [msLeft, setMsLeft] = useState(DURATION_MS);
  const startRef = useRef(0);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Любая клавиша тоже считается действием — "APM" в киберспорте это не
  // только клики, но и нажатия клавиш.
  useEffect(() => {
    if (phase !== "running") return;
    function onKeyDown() {
      setActions((a) => a + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  function onClick() {
    if (phase === "finished") return;

    if (phase === "idle") {
      startRef.current = performance.now();
      setActions(1);
      setMsLeft(DURATION_MS);
      setPhase("running");

      tickRef.current = setInterval(() => {
        const left = Math.max(0, DURATION_MS - (performance.now() - startRef.current));
        setMsLeft(left);
      }, 100);

      endTimeoutRef.current = setTimeout(() => {
        if (tickRef.current) clearInterval(tickRef.current);
        setMsLeft(0);
        setPhase("finished");
      }, DURATION_MS);
      return;
    }

    if (phase === "running") {
      setActions((a) => a + 1);
    }
  }

  function reset() {
    setPhase("idle");
    setActions(0);
    setMsLeft(DURATION_MS);
  }

  const apm = phase === "finished" ? Math.round(actions / (DURATION_MS / 1000 / 60)) : 0;

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">🔥 APM Test</h1>
      <p className="mt-1 text-sm text-gray-500">Клики и нажатия клавиш за 60 секунд — считаем APM.</p>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm font-medium text-gray-600">
        {phase !== "idle" && (
          <>
            <span>Действий: {actions}</span>
            <span>Осталось: {Math.ceil(msLeft / 1000)} с</span>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={phase === "finished"}
        className="mt-4 flex h-[320px] w-full select-none flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 text-center transition-transform duration-100 active:scale-[0.99] disabled:opacity-70"
      >
        {phase === "idle" && (
          <>
            <span className="text-lg font-bold">Нажми, чтобы начать</span>
            <span className="text-sm text-gray-500">Клик или любая клавиша считаются действием</span>
          </>
        )}
        {phase === "running" && <span className="text-5xl font-black text-brand">{actions}</span>}
        {phase === "finished" && (
          <>
            <span className="text-4xl font-black">{apm} APM</span>
            <span className="text-sm text-gray-500">{actions} действий за 60 секунд</span>
          </>
        )}
      </button>

      {phase === "finished" && (
        <button
          type="button"
          onClick={reset}
          className="mt-4 w-full rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
        >
          Ещё раз
        </button>
      )}
    </div>
  );
}
