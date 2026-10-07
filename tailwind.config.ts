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
        brand: {
          red: "#C62828",
          redHover: "#B71C1C",
          redLight: "#FFEBEE",
          charcoal: "#111827",
          bg: "#F8F7F3",
          card: "#FFFFFF",
          muted: "#6B7280",
          border: "#E5E7EB",
        },
        civic: {
          navy: "#111827",
          navyDark: "#0B0F17",
          slate: {
            50: "#F8F7F3",
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          },
        },
        verified: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          dark: "#047857",
        },
        review: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
          dark: "#B45309",
        },
        alert: {
          DEFAULT: "#C62828",
          light: "#FFEBEE",
          dark: "#B71C1C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        bengali: ["var(--font-bengali)", "'Noto Sans Bengali'", "'Hind Siliguri'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
