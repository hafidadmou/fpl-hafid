import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#07130f',
        card: '#0f1f1a',
        accent: '#5ad18d',
        accentSoft: '#93f0b1',
        panel: '#111d1a',
        mutter: '#d5e8de',
        muted: '#8aa49b',
      },
      boxShadow: {
        glow: '0 20px 45px rgba(90, 209, 141, 0.18)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSlow: 'pulse 2.6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
