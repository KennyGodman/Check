/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ledger: {
          950: '#070A0F',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC',
        },
        civic: {
          paper: '#F4F1EA',
          parchment: '#EFECE6',
          ink: '#1A1C1E',
          burgundy: '#5B1A24',
          gold: '#B45309',
        },
        verdict: {
          kept: '#065F46',
          keptBg: '#ECFDF5',
          keptBorder: '#A7F3D0',
          broken: '#991B1B',
          brokenBg: '#FEF2F2',
          brokenBorder: '#FCA5A5',
          partial: '#92400E',
          partialBg: '#FFFBEB',
          partialBorder: '#FDE68A',
          insufficient: '#475569',
          insufficientBg: '#F8FAFC',
          insufficientBorder: '#CBD5E1',
          pending: '#1E40AF',
          pendingBg: '#EFF6FF',
          pendingBorder: '#BFDBFE',
        }
      },
      fontFamily: {
        serif: ['Lora', 'Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
