import type { Config } from "tailwindcss";

// ink/slate завязаны на CSS-переменные (см. globals.css: :root vs .dark) —
// это даёт тёмную тему без переписывания каждого файла: те же классы
// (bg-ink-800, text-slate-600 и т.п.) сами перекрашиваются при переключении.
function cssVar(name: string) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5B4FE0",
          dark: "#4636C4",
          light: "#6C5DD3",
        },
        // 900 = фон страницы, 800 = карточки, 700/600 = ховеры/бордеры.
        ink: {
          900: cssVar("--ink-900"),
          800: cssVar("--ink-800"),
          700: cssVar("--ink-700"),
          600: cssVar("--ink-600"),
        },
        slate: {
          50: cssVar("--slate-50"),
          100: cssVar("--slate-100"),
          200: cssVar("--slate-200"),
          300: cssVar("--slate-300"),
          400: cssVar("--slate-400"),
          500: cssVar("--slate-500"),
          600: cssVar("--slate-600"),
          700: cssVar("--slate-700"),
          900: cssVar("--slate-900"),
        },
      },
      boxShadow: {
        glow: "0 4px 16px rgba(15,23,42,0.08)",
        "glow-lg": "0 12px 32px rgba(15,23,42,0.12)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5B4FE0 0%, #7C6FF0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
