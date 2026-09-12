import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta "blueprint": lienzo oscuro azulado con acento cian de
        // plano arquitectónico. Se define aquí en vez de usar los grises
        // neutros por defecto de Tailwind.
        base: {
          950: '#0A0E14',
          900: '#0D1117',
          800: '#131A22',
          700: '#1C2530',
          600: '#2A3542',
        },
        ink: {
          100: '#E6EDF3',
          300: '#B4C0CC',
          500: '#7D8A99',
        },
        blueprint: {
          DEFAULT: '#4FD1C5',
          soft: '#4FD1C51A',
          strong: '#7EE8DC',
        },
        alert: {
          DEFAULT: '#F2777B',
          soft: '#F2777B1A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sheet: '0 -8px 24px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config;
