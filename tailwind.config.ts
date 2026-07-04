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
        void: "#0B0B0D",
        surface: {
          DEFAULT: "#16151A",
          2: "#1E1D24",
        },
        hairline: "#2C2A32",
        paper: "#F2EFE9",
        muted: "#8C8A85",
        amber: {
          DEFAULT: "#E8A33D",
          dim: "#8A6529",
        },
        teal: {
          DEFAULT: "#3E7C74",
          bright: "#5FAFA3",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
