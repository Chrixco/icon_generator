import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cozy RPG Color Palette
        cream: {
          50: 'var(--color-cream-50)',
          100: 'var(--color-cream-100)',
          200: 'var(--color-cream-200)',
          300: 'var(--color-cream-300)',
          400: 'var(--color-cream-400)',
          500: 'var(--color-cream-500)',
          600: 'var(--color-cream-600)',
          700: 'var(--color-cream-700)',
          800: 'var(--color-cream-800)',
          900: 'var(--color-cream-900)',
        },
        sage: {
          50: 'var(--color-sage-50)',
          100: 'var(--color-sage-100)',
          200: 'var(--color-sage-200)',
          300: 'var(--color-sage-300)',
          400: 'var(--color-sage-400)',
          500: 'var(--color-sage-500)',
          600: 'var(--color-sage-600)',
          700: 'var(--color-sage-700)',
          800: 'var(--color-sage-800)',
          900: 'var(--color-sage-900)',
        },
        warmwood: {
          50: 'var(--color-warmwood-50)',
          100: 'var(--color-warmwood-100)',
          200: 'var(--color-warmwood-200)',
          300: 'var(--color-warmwood-300)',
          400: 'var(--color-warmwood-400)',
          500: 'var(--color-warmwood-500)',
          600: 'var(--color-warmwood-600)',
          700: 'var(--color-warmwood-700)',
          800: 'var(--color-warmwood-800)',
          900: 'var(--color-warmwood-900)',
        },
        sunset: {
          50: 'var(--color-sunset-50)',
          100: 'var(--color-sunset-100)',
          200: 'var(--color-sunset-200)',
          300: 'var(--color-sunset-300)',
          400: 'var(--color-sunset-400)',
          500: 'var(--color-sunset-500)',
          600: 'var(--color-sunset-600)',
          700: 'var(--color-sunset-700)',
          800: 'var(--color-sunset-800)',
          900: 'var(--color-sunset-900)',
        },
        // Theme Colors
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config