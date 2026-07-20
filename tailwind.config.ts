import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        frame: "#DDDDD8",
        bg: "#F5F5F2",
        ink: "#101112",
        accent: "#FF4400",
        fit: "#00A868",
        line: "#E4E4DF",
        cardline: "#ECECE7",
        divider: "#F3F3EF",
        muted: "#7A7A74",
        muted2: "#3A3A36",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
