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
        // Warm neutrals
        canvas:  '#F7F5F0',
        card:    '#FEFCF8',
        'card-hover': '#FEFDFB',
        paper:   '#FEFCF8',
        ink:     '#1C1917',
        'ink-muted': '#78716C',
        'ink-faint': '#A8A29E',
        divider: '#E8E4DD',

        // Dark hero band
        forest:  '#1A2412',
        'forest-card': '#243018',

        // Accents
        lime:    '#AAFF4D',
        'lime-dim': '#8FD93D',
        sage:    '#8FAF7E',
        'sage-light': '#C4D9BC',
        clay:    '#D4B896',
        'clay-light': '#EDE0D0',

        // Pastel label fills
        'label-convert':  '#EAF4FF',
        'label-organize': '#F0EAF8',
        'label-edit':     '#FFF5EA',
        'label-security': '#EAF8F0',
        'label-optimize': '#FFF8EA',
      },
      borderRadius: {
        xl:   '16px',
        '2xl':'24px',
        '3xl':'32px',
        '4xl':'40px',
        pill: '9999px',
      },
      boxShadow: {
        card:       '0 2px 8px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
        'card-lift':'0 8px 24px rgba(28,25,23,0.10), 0 2px 6px rgba(28,25,23,0.06)',
        'card-wide':'0 4px 16px rgba(28,25,23,0.08)',
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
