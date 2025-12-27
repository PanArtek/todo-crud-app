import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SofaScore-inspired dark theme
        background: {
          DEFAULT: "#1a1a2e",
          secondary: "#16213e",
          card: "#1f1f3a",
        },
        accent: {
          primary: "#e94560",
          secondary: "#00d4ff",
        },
        foreground: {
          DEFAULT: "#ffffff",
          muted: "#a0a0b0",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
