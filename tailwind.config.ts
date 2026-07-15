import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Фирменные цвета: тёмный фон + синий/голубой акцент (не зелёный — это цвет конкурента)
        brand: {
          DEFAULT: "#3b82f6", // blue-500
          dark: "#2563eb", // blue-600
          light: "#22d3ee", // cyan-400
        },
        ink: {
          900: "#0a0f14",
          800: "#0f1620",
          700: "#161f2b",
          600: "#1e2937",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(59,130,246,0.5)",
        "glow-lg": "0 0 40px rgba(59,130,246,0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
