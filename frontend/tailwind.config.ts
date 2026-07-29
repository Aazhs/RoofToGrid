import type { Config } from 'tailwindcss';

/**
 * Palette is deliberately narrow. Text colours are chosen for ≥ 4.5:1 contrast on their backgrounds
 * (NFR-U5); `brand-700` on white and white on `brand-700` both clear that bar.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc071',
          400: '#ff9a38',
          500: '#ff7d12',
          600: '#f05e06',
          700: '#c74507',
          800: '#9e360e',
          900: '#7f2e0f',
        },
        slate: {
          950: '#0b1220',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;
