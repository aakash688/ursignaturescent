import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        noir: { DEFAULT: '#0A0A0A', 50: '#1A1A1A', 100: '#111111', elevated: '#141414', card: '#0E0E0E', border: '#1C1C1C' },
        gold: { DEFAULT: '#C9A84C', light: '#E2C87A', dark: '#9A7A30', deep: '#A07828', pale: '#F5E9C4', ghost: 'rgba(201,168,76,0.08)', muted: 'rgba(201,168,76,0.15)' },
        ivory: { DEFAULT: '#F5F0E8', muted: '#D4CEC5' },
        smoke: { DEFAULT: '#6B6B6B', light: '#9B9B9B', dark: '#3A3A3A' },
        charcoal: '#111111',
        mist: '#1E1E1E',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        nav: ['Tenor Sans', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-out-right': 'slideOutRight 0.3s ease-in forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideOutRight: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        spin: { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(105deg, #C9A84C 0%, #F0D98A 40%, #C9A84C 60%, #9A7A30 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'gold': '0 0 0 1px rgba(201,168,76,0.3)',
        'gold-lg': '0 8px 32px rgba(201,168,76,0.12)',
        'dark': '0 4px 24px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}

export default config
