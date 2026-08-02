import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperDonat — пополнение игровой валюты",
  description:
    "Быстрое и надёжное пополнение алмазов, UC и пропусков в популярных играх — PUBG Mobile, Free Fire и другие.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
