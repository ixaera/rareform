/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Winter color palette
        'lavender': {
          50: '#F9F8FC',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        'indigo': {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#5B21B6',
          700: '#4C1D95',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        'violet': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B0764',
          950: '#2E1065',
        },
      },
    },
  },
  plugins: [],
}
