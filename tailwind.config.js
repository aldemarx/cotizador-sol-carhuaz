/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cian: {
          500: '#17AEE6',
          600: '#1290C1',
          700: '#0E708F',
        },
        naranja: {
          500: '#F29030',
          600: '#CF7414',
        },
      },
    },
  },
  plugins: [],
};
