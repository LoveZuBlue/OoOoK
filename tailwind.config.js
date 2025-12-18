/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Noto Serif SC', 'serif'], 
      },
    },
  },
  plugins: [],
}