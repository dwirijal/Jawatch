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
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        accent: "rgb(var(--accent) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        void: "rgb(var(--background))",
        surface: "rgb(var(--card))",
        hairline: "rgb(var(--border))",
        paper: "rgb(var(--foreground))",
        amber: "rgb(var(--primary))",
        teal: "rgb(var(--accent))",
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
