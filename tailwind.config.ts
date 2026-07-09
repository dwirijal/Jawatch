import type { Config } from "tailwindcss";
import { text, tracking, motion, shadow, container } from "./src/components/ui/tokens";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        page: container.maxWidth, // single source for the 1160px content width
      },
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-bright": "rgb(var(--accent-bright) / <alpha-value>)",
        destructive: "rgb(var(--destructive) / <alpha-value>)",
        void: "rgb(var(--background))",
        surface: "rgb(var(--card))",
        hairline: "rgb(var(--border))",
        paper: "rgb(var(--foreground))",
        amber: "rgb(var(--primary))",
        teal: "rgb(var(--accent))",
      },
      borderRadius: {
        sm: "2px",
        chip: "8px",
        card: "14px",
        pill: "20px",
        page: "4px",
      },
      fontSize: {
        eyebrow: [text.eyebrow, { lineHeight: "1.2", letterSpacing: tracking.eyebrow }],
        tag: [text.tag, { lineHeight: "1.3", letterSpacing: tracking.tag }],
        micro: [text.micro, { lineHeight: "1.4", letterSpacing: tracking.micro }],
        chip: [text.chip, { lineHeight: "1.4", letterSpacing: tracking.xs }],
        body: [text.body, { lineHeight: "1.6" }],
        title: [text.title, { lineHeight: "1.1", letterSpacing: tracking.wide }],
      },
      letterSpacing: {
        eyebrow: tracking.eyebrow,
        label: tracking.label,
        tag: tracking.tag,
        micro: tracking.micro,
        xs: tracking.xs,
        wide: tracking.wide,
        wide2: tracking.wide2,
        wide3: tracking.wide3,
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      transitionDuration: {
        fast: motion.duration.fast,
        base: motion.duration.base,
        slow: motion.duration.slow,
      },
      transitionTimingFunction: {
        "out-expo": motion.ease.outExpo,
        press: motion.ease.press,
      },
      boxShadow: {
        toast: shadow.toast,
        lift: shadow.lift,
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
