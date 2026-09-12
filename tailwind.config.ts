import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Todos los colores referencian variables CSS definidas en index.css,
        // así el cambio de tema claro ↔ oscuro es instantáneo sin re-render.
        base: {
          950: 'var(--color-base-950)',
          900: 'var(--color-base-900)',
          800: 'var(--color-base-800)',
          700: 'var(--color-base-700)',
          600: 'var(--color-base-600)',
        },
        ink: {
          100: 'var(--color-ink-100)',
          300: 'var(--color-ink-300)',
          500: 'var(--color-ink-500)',
        },
        blueprint: {
          DEFAULT: 'var(--color-blueprint)',
          soft: 'var(--color-blueprint-soft)',
          strong: 'var(--color-blueprint-strong)',
        },
        alert: {
          DEFAULT: 'var(--color-alert)',
          soft: 'var(--color-alert-soft)',
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
