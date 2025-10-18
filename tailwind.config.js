/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2185d0',
        success: '#21ba45',
        warning: '#fbbd08',
        danger: '#db2828',
        info: '#31ccec',
      },
    },
  },
  plugins: [],
}

