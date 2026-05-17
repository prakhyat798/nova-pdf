/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // All colors now reference CSS variables — work in both light + dark
        canvas:        'var(--color-canvas)',
        card:          'var(--color-card)',
        'card-hover':  'var(--color-card-hover)',
        paper:         'var(--color-card)',
        ink:           'var(--color-ink)',
        'ink-muted':   'var(--color-ink-muted)',
        'ink-faint':   'var(--color-ink-faint)',
        divider:       'var(--color-divider)',
        forest:        'var(--color-forest)',
        'forest-card': 'var(--color-forest-card)',
        lime:          'var(--color-accent)',
        'lime-dim':    'var(--color-accent-dim)',
        sage:          'var(--color-sage)',
        'sage-light':  'var(--color-sage-light)',
        clay:          'var(--color-clay)',
        'clay-light':  'var(--color-clay-light)',
      },
      borderRadius: {
        xl:   '16px',
        '2xl':'24px',
        '3xl':'32px',
        '4xl':'40px',
        pill: '9999px',
      },
      boxShadow: {
        card:       '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'card-lift':'0 8px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
        'card-wide':'0 4px 16px rgba(0,0,0,0.10)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        morph: {
          '0%,100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%':     { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%':     { borderRadius: '50% 60% 30% 70% / 40% 50% 70% 30%' },
          '75%':     { borderRadius: '70% 30% 60% 40% / 30% 70% 40% 60%' },
        },
        'slide-in-bottom': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'morph-slow':   'morph 14s ease-in-out infinite',
        'morph-medium': 'morph 10s ease-in-out infinite reverse 2s',
        'slide-in':     'slide-in-bottom 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
