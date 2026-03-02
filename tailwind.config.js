/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'sticky-yellow': '#fef08a',
        'sticky-pink': '#fbcfe8',
        'sticky-blue': '#bfdbfe',
        'sticky-green': '#bbf7d0',
        'sticky-orange': '#fed7aa',
        'sticky-purple': '#e9d5ff',
      },
      boxShadow: {
        'sticky': '2px 2px 8px rgba(0,0,0,0.1)',
        'sticky-hover': '4px 4px 16px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}