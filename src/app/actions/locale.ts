"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n/locales";
import { LOCALE_COOKIE } from "@/lib/i18n/get-locale";

const MAX_AGE = 60 * 60 * 24 * 365; // 1 год

export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  cookies().set(LOCALE_COOKIE, locale, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
  revalidatePath("/", "layout");
}
