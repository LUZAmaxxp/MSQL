/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0eafc',
          200: '#c7d9fa',
          300: '#9bbdf7',
          400: '#6499f2',
          500: '#3b7aec',
          600: '#255ddf',
          700: '#1e4acb',
          800: '#1e3fa6',
          900: '#1e3683',
          950: '#152252',
        },
        secondary: {
          50: '#f9f8f6',
          100: '#f2f0ec',
          200: '#e3ded4',
          300: '#d5ceba',
          400: '#b9ae94',
          500: '#a19576',
          600: '#8a7e62',
          700: '#726651',
          800: '#5e5444',
          900: '#4f473a',
          950: '#29241d',
        },
        accent: {
          50: '#fdf7f1',
          100: '#f9ebe0',
          200: '#f4d8bb',
          300: '#ecbc8c',
          400: '#e59a5c',
          500: '#df7c34',
          600: '#d06727',
          700: '#ad4f20',
          800: '#8c401f',
          900: '#73371c',
          950: '#3d1a0d',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(21, 34, 82, 0.08)',
        'elegant-lg': '0 8px 30px -4px rgba(21, 34, 82, 0.12)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};