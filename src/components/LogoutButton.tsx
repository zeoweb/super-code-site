"use client";

import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export function LogoutButton() {
  return (
    <form
      action={logoutAction}
      onSubmit={(e) => {
        if (!confirm("Точно выйти из аккаунта?")) e.preventDefault();
      }}
    >
      <SubmitButton
        className="btn-ghost w-full border-red-500/30 text-red-600 hover:border-red-500/50 hover:bg-red-500/10"
        pendingText="Выходим…"
      >
        Выйти из аккаунта
      </SubmitButton>
    </form>
  );
}
