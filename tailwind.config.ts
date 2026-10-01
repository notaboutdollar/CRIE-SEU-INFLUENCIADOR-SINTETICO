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
        bg: "#F4EFE7",
        paper: "#FFFFFF",
        ink: {
          DEFAULT: "#0F0F0F",
          soft: "#2a2a2a",
        },
        muted: "#6B6B6B",
        line: {
          DEFAULT: "#E4DDD0",
          strong: "#C9BFA9",
        },
        accent: {
          DEFAULT: "#16A34A",
          soft: "#D1FAE5",
          strong: "#15803D",
        },
        ok: {
          DEFAULT: "#2F7A3D",
          soft: "#E4F1E4",
        },
        warn: {
          DEFAULT: "#B33A16",
          soft: "#FBEAE2",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.03)",
        soft: "0 4px 20px -8px rgba(0,0,0,0.08)",
        focus: "0 0 0 3px rgba(22,163,74,0.18)",
      },
      letterSpacing: {
        eye: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
