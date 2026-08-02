import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Фирменные цвета: светлый минимализм + сине-фиолетовый акцент.
        brand: {
          DEFAULT: "#5B4FE0",
          dark: "#4636C4",
          light: "#6C5DD3",
        },
        // "ink" исторически был тёмным фоном — теперь это светлая шкала
        // поверхностей (900 = фон страницы, 800 = карточки, 700/600 = ховеры).
        ink: {
          900: "#F5F5FA",
          800: "#FFFFFF",
          700: "#F1F1F6",
          600: "#E4E4EC",
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
