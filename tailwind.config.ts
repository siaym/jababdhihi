import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          navy: "#0f2942",
          navyDark: "#0a1d30",
          navyLight: "#183b5e",
          slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          },
        },
        verified: {
          DEFAULT: "#059669",
          light: "#d1fae5",
          dark: "#047857",
        },
        review: {
          DEFAULT: "#d97706",
          light: "#fef3c7",
          dark: "#b45309",
        },
        alert: {
          DEFAULT: "#e11d48",
          light: "#ffe4e6",
          dark: "#be123c",
        },
        accent: {
          teal: "#0d9488",
          tealLight: "#ccfbf1",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        bengali: ["var(--font-bengali)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
