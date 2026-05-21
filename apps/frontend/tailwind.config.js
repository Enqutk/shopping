/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        femme: {
          black: '#000000',
          surface: '#0a0a0a',
          slate: '#566775',
          champagne: '#c9a962',
          'champagne-light': '#e8d5a8',
          muted: '#9ca3af',
          border: 'rgba(201, 169, 98, 0.35)',
        },
        arctic: {
          base: '#000000',
          card: '#0f0f0f',
          deep: '#fafafa',
          light: '#a3a3a3',
          mist: '#566775',
          steel: '#7c8c99',
          shine: '#141414',
          glow: '#566775',
        },
        luxe: {
          ink: '#000000',
          charcoal: '#1a1a1a',
          slate: '#566775',
          mist: '#2a2a2a',
          cream: '#e8d5a8',
          blush: '#1a1a1a',
          rose: '#c97b8a',
          accent: '#c9a962',
          gold: '#c9a962',
        },
        fashion: {
          accent: '#c9a962',
          ink: '#000000',
          blush: '#0f0f0f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      borderRadius: {
        arctic: '0.5rem',
      },
      boxShadow: {
        arctic: '0 8px 32px rgba(0, 0, 0, 0.45)',
        'arctic-lg': '0 16px 48px rgba(0, 0, 0, 0.55)',
        shine: '0 0 24px rgba(201, 169, 98, 0.15)',
        femme: '0 0 40px rgba(201, 169, 98, 0.12)',
      },
      backgroundImage: {
        'femme-hero':
          'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)',
        'champagne-shine':
          'linear-gradient(135deg, rgba(232,213,168,0.25) 0%, rgba(201,169,98,0.08) 50%, transparent 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
