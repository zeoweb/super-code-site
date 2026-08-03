"use server";

import { cookies } from "next/headers";

const THEME_COOKIE = "theme";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 год

export async function setThemeAction(theme: "light" | "dark"): Promise<void> {
  cookies().set(THEME_COOKIE, theme, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
}
