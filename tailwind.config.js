/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bunny: {
          orange: '#D96A32',
          ember: '#C45A26',
          ink: '#12100E',
          coal: '#1B1815',
          steel: '#3A332C',
          chalk: '#F3EEE8',
          mute: '#A89A8C',
        },
      },
      fontFamily: {
        display: ['Satoshi', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
