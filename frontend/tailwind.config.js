/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D2B48C',
        secondary: '#8B7355',
        accent: '#2C2C2C',
        light: '#F5F5F5',
        dark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Mali', 'Schoolbell', 'cursive'],
      },
    },
  },
  plugins: [],
}
