"use client";

import { useRef, useState } from "react";

const TEXTS = [
  "Быстрая коричневая лиса перепрыгивает через ленивую собаку возле старого моста.",
  "Программирование — это искусство превращать кофе в работающий код без единой ошибки.",
  "Солнце медленно садилось за горизонт, окрашивая небо в тёплые оранжевые тона.",
  "Каждый день — это новая возможность стать немного лучше, чем ты был вчера.",
  "Дождь стучал по крыше, а в комнате было тепло и уютно от горящего камина.",
  "Успех приходит к тем, кто готов работать усердно и не сдаваться перед трудностями.",
  "В тихом лесу пели птицы, и лёгкий ветер шевелил листья высоких деревьев.",
  "Технологии меняют мир быстрее, чем мы успеваем к ним привыкнуть и адаптироваться.",
];

type Phase = "idle" | "running" | "finished";

export function TypingSpeedGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [target, setTarget] = useState(TEXTS[0]);
  const [input, setInput] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function start() {
    const text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setTarget(text);
    setInput("");
    setElapsedMs(0);
    startRef.current = 0;
    setPhase("running");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (startRef.current === 0 && value.length > 0) startRef.current = performance.now();
    setInput(value);

    if (value.length >= target.length) {
      setElapsedMs(performance.now() - startRef.current);
      setPhase("finished");
    }
  }

  let correctChars = 0;
  for (let i = 0; i < Math.min(input.length, target.length); i++) {
    if (input[i] === target[i]) correctChars++;
  }
  const accuracy = target.length > 0 ? Math.round((correctChars / target.length) * 100) : 100;
  const words = target.trim().split(/\s+/).length;
  const minutes = elapsedMs / 1000 / 60;
  const wpm = phase === "finished" && minutes > 0 ? Math.round(words / minutes) : 0;

  return (
    <div>
      <a href="/play" className="text-sm text-gray-500 hover:text-gray-900">← Все игры</a>
      <h1 className="mt-3 text-2xl font-bold">⌨️ Typing Speed Test</h1>
      <p className="mt-1 text-sm text-gray-500">Напечатай текст как можно быстрее и точнее.</p>

      <div className="mt-4 flex min-h-[320px] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        {phase === "idle" && (
          <>
            <span className="text-lg font-bold">Проверь скорость печати</span>
            <span className="text-sm text-gray-500">Таймер запустится с первой буквы</span>
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-brand-gradient px-6 py-3 font-semibold text-white shadow-md transition-transform duration-300 hover:scale-105"
            >
              Начать
            </button>
          </>
        )}

        {phase === "running" && (
          <div className="w-full">
            <p className="text-left text-lg leading-relaxed">
              {target.split("").map((ch, i) => {
                const typed = input[i];
                const color =
                  typed === undefined
                    ? "text-gray-400"
                    : typed === ch
                      ? "text-emerald-600"
                      : "text-red-500 underline";
                return (
                  <span key={i} className={color}>
                    {ch}
                  </span>
                );
              })}
            </p>
            <input
              ref={inputRef}
              value={input}
              onChange={onChange}
              className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-brand"
              placeholder="Начни печатать здесь..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}

        {phase === "finished" && (
          <>
            <span className="text-4xl font-black">{wpm} WPM</span>
            <span className="text-sm text-gray-500">Точность: {accuracy}%</span>
          </>
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
