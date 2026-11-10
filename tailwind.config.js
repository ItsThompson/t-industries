import { THEME_COLORS } from './src/lib/theme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: THEME_COLORS,
      fontFamily: {
        display: ['VT323', 'monospace'],
        outfit: ['Outfit', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
