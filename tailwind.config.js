/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'test2': '#ff00ff', // Bright magenta color that will be very obvious
        primary: '#1ed760',    // Spotify green
        secondary: '#000000',  // Black
        'body-bg': '#eaeaea',
        'body-color': '#000000',
        'button': '#38b85d',
        gray: {
          350: '#b1b1b1',
        }
      },
      fontFamily: {
        sans: ['Quicksand', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
    colors: {  // Note: not using 'extend' here
      'test': '#ff00ff',
    }
  },
  plugins: [],
}