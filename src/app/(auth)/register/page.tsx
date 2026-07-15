"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { registerAction, type ActionState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Reveal } from "@/components/Reveal";
import { AuthCharacter } from "@/components/AuthCharacter";

type Field = "name" | "email" | "phone" | "password" | null;

const MESSAGES: Record<Exclude<Field, null>, string> = {
  name: "Как вас зовут?",
  email: "Какой у вас email?",
  phone: "Ваш номер телефона?",
  password: "Не подглядываю! 🙈",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const [state, action] = useFormState<ActionState, FormData>(registerAction, undefined);
  const [active, setActive] = useState<Field>(null);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center gap-10 overflow-hidden p-6 py-12 lg:flex-row lg:justify-center lg:py-6">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />

      <Reveal className="hidden shrink-0 lg:block lg:flex-1">
        <div className="flex justify-end pr-8">
          <AuthCharacter
            gradientId="auth-character-register"
            message={active ? MESSAGES[active] : "Привет! 👋"}
            coverEyes={active === "password"}
            lookDown={active === "phone" || active === "password"}
          />
        </div>
      </Reveal>

      <Reveal className="w-full max-w-md lg:flex-1">
        <div className="text-center lg:hidden">
          <AuthCharacter
            gradientId="auth-character-register-mobile"
            message={active ? MESSAGES[active] : "Привет! 👋"}
            coverEyes={active === "password"}
            lookDown={active === "phone" || active === "password"}
          />
        </div>
        <div className="text-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            SUPER<span className="bg-brand-gradient bg-clip-text text-transparent">CODE</span>
          </Link>
        </div>
        <div className="card mt-6">
          <span className="badge border-brand/40 text-brand-light">Старт сегодня</span>
          <h1 className="mt-3 text-2xl font-bold">Регистрация в Super Code</h1>
          <p className="mt-1 text-sm text-slate-400">
            Укажите email и телефон — входить сможете любым из них.
          </p>

          <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="returnTo" value={searchParams.returnTo ?? ""} />
          <div>
            <label className="label" htmlFor="name">Имя</label>
            <input
              id="name"
              name="name"
              className="input"
              placeholder="Как к вам обращаться"
              required
              onFocus={() => setActive("name")}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              required
              onFocus={() => setActive("email")}
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Телефон</label>
            <input
              id="phone"
              name="phone"
              className="input"
              placeholder="+992 90 000 00 00"
              required
              onFocus={() => setActive("phone")}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="Минимум 8 символов"
              required
              onFocus={() => setActive("password")}
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{state.error}</p>
          )}

          <SubmitButton pendingText="Создаём аккаунт…">Начать бесплатно</SubmitButton>
        </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Уже есть аккаунт?{" "}
            <Link
              href={searchParams.returnTo ? `/login?returnTo=${encodeURIComponent(searchParams.returnTo)}` : "/login"}
              className="text-brand-light hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </Reveal>
    </main>
  );
}
