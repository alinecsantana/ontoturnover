import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#92400E",
        },
        gemini: {
          DEFAULT: "#1A73E8",
          light: "#E8F0FE",
          dark: "#1557B0",
        },
        copilot: {
          DEFAULT: "#0078D4",
          light: "#EFF6FF",
          dark: "#004E8C",
        },
        sidebar: "#0F172A",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
