"use client";

import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form
      action={logoutAction}
      onSubmit={(e) => {
        if (!confirm("Точно выйти из аккаунта?")) e.preventDefault();
      }}
    >
      <button className="btn-ghost w-full border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10">
        Выйти из аккаунта
      </button>
    </form>
  );
}
