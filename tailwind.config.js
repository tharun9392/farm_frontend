/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f6f7f1',
          100: '#e4e8d3',
          200: '#d0d9b3',
          300: '#b8c78c',
          400: '#a3b56b',
          500: '#8da350', // Primary color
          600: '#758a40',
          700: '#5d6c33',
          800: '#454f25',
          900: '#2d3319',
        },
        secondary: {
          50: '#f4f9f9',
          100: '#d9eded',
          200: '#bde0e0',
          300: '#9cd1d0',
          400: '#7bc1c0',
          500: '#5baead', // Secondary color
          600: '#468d8b',
          700: '#376c6a',
          800: '#285150',
          900: '#1a3434',
        },
        accent: {
          50: '#fef8f0',
          100: '#fbecd7',
          200: '#f8dbb3',
          300: '#f4c88c',
          400: '#f0b566',
          500: '#ec9e3e', // Accent color
          600: '#dc8421',
          700: '#b5681a',
          800: '#8e5013',
          900: '#683a0d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'custom': '0 4px 16px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
} 