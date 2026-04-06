/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf8f5',
          100: '#f5f0eb',
          200: '#ebe3d9',
          300: '#d9ccbc',
          400: '#c5b9a8',
          500: '#a89888',
          600: '#8a7a6a',
        },
        ocean: {
          50: '#e8f0f3',
          100: '#c8dce3',
          200: '#96b8c7',
          300: '#6494ab',
          400: '#3d7088',
          500: '#1a3a4a',
          600: '#142e3b',
          700: '#0e222c',
          800: '#08161d',
          900: '#040b0e',
        },
        coral: {
          400: '#e8957a',
          500: '#e07c5a',
          600: '#c66a4a',
        },
        evergreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
