import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        /* CAFlow Brand — Deep Terracotta / Burnt Orange */
        brand: {
          50:  '#FFF4EE', 100: '#FFE4D0', 200: '#FFC5A0',
          300: '#FF9B6A', 400: '#F97316', 500: '#E85D0A',
          600: '#C84B0F', 700: '#A33A0C', 800: '#7D2D09',
          900: '#5C2007', 950: '#3D1404',
        },
        /* Accent — Golden Amber */
        gold: {
          50:  '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F5A623',
          600: '#D97706', 700: '#B45309', 800: '#92400E', 900: '#78350F',
        },
        /* Warm Neutrals */
        warm: {
          50:  '#FAFAF8', 100: '#F5F2EE', 200: '#EDE8E1',
          300: '#E0D9D0', 400: '#C9BFB3', 500: '#A09890',
          600: '#7A7068', 700: '#5E5650', 800: '#3D3730', 900: '#1A1512',
        },
        /* Semantic */
        success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#14532D' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#78350F' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#7F1D1D' },
        info:    { DEFAULT: '#0EA5E9', light: '#E0F2FE', dark: '#0C4A6E' },

        /* Shadcn compat */
        border:     'rgb(var(--border) / <alpha-value>)',
        input:      'rgb(var(--input) / <alpha-value>)',
        ring:       'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
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
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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

      borderRadius: {
        none: '0', sm: '6px', DEFAULT: '10px', md: '10px',
        lg: '14px', xl: '18px', '2xl': '24px', full: '9999px',
      },

      spacing: {
        4.5: '18px', 5.5: '22px', 7.5: '30px', 13: '52px',
        15: '60px', 18: '72px', 22: '88px',
      },

      boxShadow: {
        xs:           '0 1px 2px 0 rgb(26 21 18 / 0.06)',
        sm:           '0 1px 3px 0 rgb(26 21 18 / 0.09), 0 1px 2px -1px rgb(26 21 18 / 0.05)',
        md:           '0 4px 8px -1px rgb(26 21 18 / 0.08), 0 2px 4px -2px rgb(26 21 18 / 0.05)',
        lg:           '0 10px 20px -3px rgb(26 21 18 / 0.08), 0 4px 8px -4px rgb(26 21 18 / 0.05)',
        xl:           '0 20px 40px -5px rgb(26 21 18 / 0.10), 0 8px 16px -6px rgb(26 21 18 / 0.06)',
        '2xl':        '0 25px 50px -12px rgb(26 21 18 / 0.14)',
        brand:        '0 4px 18px 0 rgb(200 75 15 / 0.28)',
        glow:         '0 0 0 3px rgb(200 75 15 / 0.14)',
        card:         '0 1px 4px 0 rgb(26 21 18 / 0.06), 0 4px 12px -2px rgb(26 21 18 / 0.06)',
        'card-hover': '0 4px 16px -2px rgb(26 21 18 / 0.12), 0 8px 24px -4px rgb(26 21 18 / 0.08)',
        inner:        'inset 0 2px 4px 0 rgb(26 21 18 / 0.05)',
        none:         'none',
      },

      backgroundImage: {
        'gradient-brand':      'linear-gradient(135deg, #3D1404 0%, #7D2D09 40%, #C84B0F 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, #FFF4EE 0%, #FFE4D0 100%)',
        'gradient-hero':       'linear-gradient(145deg, #1A0D06 0%, #3D1F0A 35%, #7D2D09 70%, #C84B0F 100%)',
        'gradient-radial':     'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':       'radial-gradient(ellipse at 25% 40%, rgba(200,75,15,0.07) 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, rgba(245,166,35,0.05) 0%, transparent 55%)',
        'dot-pattern':         'radial-gradient(circle, rgba(26,21,18,0.07) 1px, transparent 1px)',
        'grid-pattern':        'linear-gradient(rgba(26,21,18,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,21,18,0.04) 1px, transparent 1px)',
      },

      backgroundSize: {
        dot:  '20px 20px',
        grid: '32px 32px',
      },

      transitionTimingFunction: {
        spring:     'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        smooth:     'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      transitionDuration: {
        '0': '0ms', '100': '100ms', '150': '150ms',
        '200': '200ms', '300': '300ms', '400': '400ms', '500': '500ms',
      },

      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer:    { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        fadeIn:     { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        blobMove:   { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(18px,-14px) scale(1.05)' }, '66%': { transform: 'translate(-10px,8px) scale(0.97)' } },
        pulse:      { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:      'shimmer 1.6s ease-in-out infinite',
        'fade-in':    'fadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.4,0,0.2,1) both',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':'slideRight 0.3s cubic-bezier(0.16,1,0.3,1) both',
        float:        'float 5s ease-in-out infinite',
        blob:         'blobMove 8s ease-in-out infinite',
        pulse:        'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
