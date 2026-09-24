/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        dark: {
          bg: '#0B0F14',
          card: '#111827',
          cardHover: '#161F33',
          border: '#1F2937',
          textPrimary: '#F9FAFB',
          textSecondary: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        urdu: ['"Noto Nastaliq Urdu"', '"Noto Sans Arabic"', '"Jameel Noori Nastaleeq"', '"Urdu Typesetting"', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '760px',
          },
        },
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
