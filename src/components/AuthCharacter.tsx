"use client";

import { AnimatePresence, motion } from "framer-motion";

// Персонаж-маскот для форм входа/регистрации: реагирует на то, какое поле
// сейчас в фокусе — "смотрит" в его сторону и закрывает глаза при вводе пароля.
export function AuthCharacter({
  message,
  coverEyes,
  lookDown,
  gradientId = "auth-character-grad",
}: {
  message: string;
  coverEyes: boolean;
  lookDown: boolean;
  gradientId?: string;
}) {
  return (
    <div className="relative mx-auto w-40 select-none sm:w-48">
      <div className="absolute -top-3 left-1/2 z-10 w-max max-w-[220px] -translate-x-1/2 -translate-y-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl border border-white/10 bg-ink-800/95 px-4 py-2 text-center text-sm font-medium text-white shadow-lg backdrop-blur-xl"
          >
            {message}
            <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-white/10 bg-ink-800/95" />
          </motion.div>
        </AnimatePresence>
      </div>

      <svg viewBox="0 0 200 220" className="w-full drop-shadow-[0_16px_36px_rgba(59,130,246,0.35)]">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Тело */}
        <rect x="55" y="92" width="90" height="108" rx="30" fill={`url(#${gradientId})`} />
        {/* Голова */}
        <circle cx="100" cy="70" r="55" fill="#141d2b" stroke={`url(#${gradientId})`} strokeWidth="4" />

        {/* Глаза — скрыты, когда персонаж "закрывает" их руками (ввод пароля) */}
        {!coverEyes && (
          <g style={{ transform: lookDown ? "translateY(6px)" : "translateY(0)", transition: "transform 0.3s ease" }}>
            <circle cx="80" cy="68" r="9" fill="white" />
            <circle cx="120" cy="68" r="9" fill="white" />
            <circle
              cx={lookDown ? 82 : 80}
              cy={lookDown ? 71 : 68}
              r="4.5"
              fill="#0f172a"
              style={{ transition: "cx 0.3s ease, cy 0.3s ease" }}
            />
            <circle
              cx={lookDown ? 122 : 120}
              cy={lookDown ? 71 : 68}
              r="4.5"
              fill="#0f172a"
              style={{ transition: "cx 0.3s ease, cy 0.3s ease" }}
            />
          </g>
        )}

        {/* Улыбка */}
        <path d="M83 92 Q100 102 117 92" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Руки в обычной позе (машут) — плавно исчезают при вводе пароля */}
        <g style={{ opacity: coverEyes ? 0 : 1, transition: "opacity 0.2s ease" }}>
          <path
            d="M58 112 Q36 100 32 78"
            stroke={`url(#${gradientId})`}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M142 112 Q164 100 168 78"
            stroke={`url(#${gradientId})`}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Руки закрывают глаза при вводе пароля — отдельная поза поверх лица */}
        <g style={{ opacity: coverEyes ? 1 : 0, transition: "opacity 0.25s ease 0.1s" }}>
          <path
            d="M58 118 Q52 85 80 64"
            stroke={`url(#${gradientId})`}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M142 118 Q148 85 120 64"
            stroke={`url(#${gradientId})`}
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
