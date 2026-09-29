/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        surface: '#0f131d',
        'surface-container-lowest': '#0a0e18',
        'surface-container-low': '#131a29',
        'surface-container': '#171b26',
        'surface-container-high': '#1e2433',
        'surface-container-highest': '#283144',
        outline: '#4b5563',
        'outline-variant': '#283145',
        'on-surface': '#f8fafc',
        'on-surface-variant': '#94a3b8',
        primary: {
          DEFAULT: '#6366f1',
          container: '#4f46e5',
          light: '#818cf8',
          dark: '#4338ca',
        },
        secondary: {
          DEFAULT: '#f97316',
          container: '#ea580c',
          light: '#fb923c',
          dark: '#c2410c',
        },
        tertiary: {
          DEFAULT: '#10b981',
          container: '#059669',
          light: '#34d399',
          dark: '#047857',
        },
        error: {
          DEFAULT: '#ef4444',
          container: '#7f1d1d',
          light: '#f87171',
        },
        card: {
          DEFAULT: '#171b26',
          elevated: '#1e2536',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-secondary': '0 0 20px rgba(249, 115, 22, 0.3)',
        'glow-tertiary': '0 0 20px rgba(16, 185, 129, 0.3)',
        'tactile-primary': '0 4px 0 0 #3730a3',
        'tactile-secondary': '0 4px 0 0 #c2410c',
      },
    },
  },
  plugins: [],
};
