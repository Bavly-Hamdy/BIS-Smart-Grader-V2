/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // Deep Academic Blue
          hover: '#172554',
        },
        secondary: {
          DEFAULT: '#0d9488', // Intelligent Teal
          hover: '#0f766e',
        },
        dark: {
          bg: '#020617', // Slate 950
          card: '#0f172a', // Slate 900
          border: '#1e293b', // Slate 800
        }
      }
    },
  },
  plugins: [],
}
