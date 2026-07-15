import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Code — вайб-кодинг с нуля",
  description:
    "Практический онлайн-курс по вайб-кодингу: реальные проекты с ИИ, с куратором и сертификатом.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
