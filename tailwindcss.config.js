/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        fontFamily: {  // Remove 'extend' for fontFamily
            sans: ['Quicksand', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
        extend: {
            colors: {
                primary: '#1ed760', // Spotify green
                secondary: '#000000', // Black
                // secondary: '#ffffff',   // From $secondary
                background: '#ffffff', // White
                button: '#38b85d',   // From $button-color
                thanks: '#b1b1b1',   // From $thanks-color
                text: {
                    primary: '#1a1a1a', // #000000
                    secondary: '#6b7280', 
                }
            },
            fontFamily: {
                sans: ['Quicksand', 'Helvetica Neue', 'Arial', 'sans-serif'], // From $font-family-sans-serif
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
    },              
    plugins: [],
  }