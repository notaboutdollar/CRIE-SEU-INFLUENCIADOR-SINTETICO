import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          card: "#111118",
          elev: "#15151e",
        },
        line: "#232330",
        ink: {
          DEFAULT: "#f4f4f6",
          mute: "#9b9bab",
          dim: "#6b6b7b",
        },
        brand: {
          DEFAULT: "#8b5cf6",
          soft: "#a78bfa",
          deep: "#6d28d9",
          glow: "rgba(139, 92, 246, 0.2)",
        },
        tip: {
          DEFAULT: "#10b981",
          soft: "#34d399",
          bg: "rgba(16, 185, 129, 0.08)",
        },
        warn: "#f59e0b",
        err: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(139,92,246,0.4), 0 0 24px rgba(139,92,246,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
