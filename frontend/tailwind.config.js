/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          black: {
            DEFAULT: '#000000',
            50: '#1a1a1a',
            100: '#111111',
            200: '#0a0a0a',
          },
          green: {
            DEFAULT: '#22C55E',
            50: '#22C55E',
            100: '#22C55E',
            200: '#16a34a',
            300: '#15803d',
          },
        },
        dark: {
          DEFAULT: '#000000',
          50: '#1a1a1a',
          100: '#111111',
        },
      },
    },
  },
  plugins: [],
}
