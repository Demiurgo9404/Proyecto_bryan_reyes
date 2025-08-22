/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5864',
        secondary: '#FE3C72',
        accent: '#FD297B',
        dark: '#1E1E1E',
        light: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
