/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        toitoiYellow: '#FACC15',
        toitoiBlack: '#000000',
        toitoiWhite: '#FFFFFF',
      }
    },
  },
  plugins: [],
}