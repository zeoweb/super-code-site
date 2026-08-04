import Link from "next/link";
import { DiamondIcon } from "@/components/DiamondIcon";

// Раздел "Играть" — набор мини-игр. Намеренно изолирован от общей темы
// сайта: всегда светлый, всегда на русском, не зависит от cookie темы/языка
// (в отличие от остального сайта). Не использует ink-*/slate-* токены и
// .card/.btn-* классы из globals.css, потому что они завязаны на CSS-
// переменные тёмной темы — здесь везде литеральные gray-*/white классы,
// которые не реагируют на класс .dark на <html>.
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <Link href="/play" className="flex items-center gap-2 text-lg font-black tracking-tight">
          <DiamondIcon id="diamond-grad-play" className="h-6 w-6" />
          Играть
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">На сайт →</Link>
      </header>
      <main className="mx-auto max-w-2xl p-6">{children}</main>
    </div>
  );
}
