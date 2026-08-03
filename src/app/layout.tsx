import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getLocale } from "@/lib/i18n/get-locale";
import { LOCALE_HTML_LANG } from "@/lib/i18n/locales";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperDonat — пополнение игровой валюты",
  description:
    "Быстрое и надёжное пополнение алмазов, UC и пропусков в популярных играх — PUBG Mobile, Free Fire и другие.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDark = cookies().get("theme")?.value === "dark";
  const locale = getLocale();

  return (
    <html lang={LOCALE_HTML_LANG[locale]} className={isDark ? "dark" : undefined}>
      <body>{children}</body>
    </html>
  );
}
