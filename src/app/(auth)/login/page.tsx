"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Reveal } from "@/components/Reveal";
import { AuthCharacter } from "@/components/AuthCharacter";

type Field = "identifier" | "password" | null;

const MESSAGES: Record<Exclude<Field, null>, string> = {
  identifier: "Email или телефон?",
  password: "Не подглядываю! 🙈",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const [state, action] = useFormState<ActionState, FormData>(loginAction, undefined);
  const [active, setActive] = useState<Field>(null);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 overflow-hidden p-6 py-12 lg:flex-row lg:justify-center lg:py-6">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />

      <Reveal className="hidden shrink-0 lg:block lg:flex-1">
        <div className="flex justify-end pr-8">
          <AuthCharacter
            gradientId="auth-character-login"
            message={active ? MESSAGES[active] : "С возвращением! 👋"}
            coverEyes={active === "password"}
            lookDown={active === "password"}
          />
        </div>
      </Reveal>

      <Reveal className="w-full max-w-md lg:flex-1">
        <div className="text-center lg:hidden">
          <AuthCharacter
            gradientId="auth-character-login-mobile"
            message={active ? MESSAGES[active] : "С возвращением! 👋"}
            coverEyes={active === "password"}
            lookDown={active === "password"}
          />
        </div>
        <div className="text-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>
          </Link>
        </div>
        <div className="card mt-6">
          <h1 className="text-2xl font-bold">Вход</h1>
          <p className="mt-1 text-sm text-slate-400">
            Введите email или номер телефона.
          </p>

          <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="returnTo" value={searchParams.returnTo ?? ""} />
          <div>
            <label className="label" htmlFor="identifier">Email или телефон</label>
            <input
              id="identifier"
              name="identifier"
              className="input"
              placeholder="you@example.com или +992…"
              required
              onFocus={() => setActive("identifier")}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              required
              onFocus={() => setActive("password")}
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
          )}

          <SubmitButton pendingText="Входим…">Войти</SubmitButton>
        </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Нет аккаунта?{" "}
            <Link
              href={searchParams.returnTo ? `/register?returnTo=${encodeURIComponent(searchParams.returnTo)}` : "/register"}
              className="text-brand-light hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </Reveal>
    </main>
  );
}
