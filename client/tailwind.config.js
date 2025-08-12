/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitar modo oscuro basado en clase
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          dark: '#0ea5e9', // Color primario para modo oscuro
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          dark: '#f472b6', // Color secundario para modo oscuro
        },
        dark: {
          // Colores personalizados para el modo oscuro
          bg: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          'text-secondary': '#e5e7eb',
          border: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      // Añadir estilos para el modo oscuro
      backgroundColor: {
        dark: {
          primary: '#111827',
          secondary: '#1f2937',
          accent: '#374151',
        },
      },
      textColor: {
        dark: {
          primary: '#f9fafb',
          secondary: '#e5e7eb',
          muted: '#9ca3af',
        },
      },
      borderColor: {
        dark: {
          DEFAULT: '#374151',
          light: '#4b5563',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
