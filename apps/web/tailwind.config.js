/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121215",
        "surface-container-lowest": "#09090b",
        "surface-container-low": "#0e0e11",
        "surface-container": "#18181b",
        "surface-container-high": "#222226",
        "surface-container-highest": "#27272a",
        outline: "#52525b",
        "outline-variant": "#27272a",
        "on-surface": "#f4f4f5",
        "on-surface-variant": "#a1a1aa",
        primary: {
          DEFAULT: "#6366f1",
          container: "#4f46e5",
          light: "#818cf8",
          dark: "#4338ca",
        },
        secondary: {
          DEFAULT: "#f59e0b",
          container: "#d97706",
          light: "#fbbf24",
          dark: "#b45309",
        },
        tertiary: {
          DEFAULT: "#10b981",
          container: "#059669",
          light: "#34d399",
          dark: "#047857",
        },
        error: {
          DEFAULT: "#ef4444",
          container: "#991b1b",
          light: "#f87171",
        },
        card: {
          DEFAULT: "#121215",
          elevated: "#18181b",
        },
      },
      fontFamily: {
        display: [
          '"Plus Jakarta Sans"',
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        headline: [
          '"Plus Jakarta Sans"',
          "Inter",
          "-apple-system",
          "sans-serif",
        ],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
