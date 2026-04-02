import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        /* CAFlow Brand — Jade Forest */
        brand: {
          50:  '#EDFAF3', 100: '#D2F4E3', 200: '#A7E8C8',
          300: '#6FD4A8', 400: '#3BBE87', 500: '#1FA96D',
          600: '#168A58', 700: '#126E47', 800: '#0F5538',
          900: '#0C402B', 950: '#07261A',
        },
        /* Warm Amber accent */
        amber: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        /* Warm Neutrals (not cold grays!) */
        sand: {
          50:  '#FAFAF8', 100: '#F5F3F0', 200: '#EAE7E2',
          300: '#DDD9D2', 400: '#C5BFB6', 500: '#9E9890',
          600: '#787168', 700: '#5C554D', 800: '#3D3730', 900: '#1A1714',
        },
        /* Semantic colors */
        success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#14532D' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#78350F' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#7F1D1D' },
        info:    { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1E3A8A' },

        /* Shadcn compat */
        border:      'rgb(var(--border) / <alpha-value>)',
        input:       'rgb(var(--input) / <alpha-value>)',
        ring:        'rgb(var(--ring) / <alpha-value>)',
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
      },

      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '1.5' }],
        xs:    ['11px', { lineHeight: '1.5' }],
        sm:    ['12.5px', { lineHeight: '1.6' }],
        base:  ['14px', { lineHeight: '1.6' }],
        md:    ['15px', { lineHeight: '1.6' }],
        lg:    ['16px', { lineHeight: '1.5' }],
        xl:    ['18px', { lineHeight: '1.4' }],
        '2xl': ['22px', { lineHeight: '1.3' }],
        '3xl': ['28px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
        '5xl': ['48px', { lineHeight: '1.05' }],
        '6xl': ['60px', { lineHeight: '1' }],
      },

      fontWeight: { 300: '300', 400: '400', 500: '500', 600: '600', 700: '700', 800: '800' },

      borderRadius: {
        none: '0', sm: '6px', DEFAULT: '8px', md: '8px',
        lg: '12px', xl: '16px', '2xl': '20px', full: '9999px',
      },

      spacing: {
        4.5: '18px', 5.5: '22px', 7.5: '30px', 13: '52px',
        15: '60px', 18: '72px', 22: '88px',
      },

      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm':    '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':    '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'lg':    '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'xl':    '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        '2xl':   '0 25px 50px -12px rgb(0 0 0 / 0.12)',
        'brand': '0 4px 14px 0 rgb(18 110 71 / 0.25)',
        'glow':  '0 0 0 3px rgb(18 110 71 / 0.15)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none':  'none',
      },

      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #0C402B 0%, #126E47 50%, #3BBE87 100%)',
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':    'radial-gradient(ellipse at 20% 50%, rgba(18,110,71,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,158,11,0.06) 0%, transparent 60%)',
        'gradient-mesh-dark': 'radial-gradient(ellipse at 20% 50%, rgba(59,190,135,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,158,11,0.04) 0%, transparent 60%)',
        'dot-pattern':      'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
        'dot-pattern-dark': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },

      backgroundSize: {
        'dot': '24px 24px',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      transitionDuration: {
        '0': '0ms', '100': '100ms', '150': '150ms',
        '200': '200ms', '300': '300ms', '500': '500ms',
      },

      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        float: 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
