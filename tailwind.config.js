/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1a56db', // El azul de mat-focused
          surface: '#f8fafc', // slate-50
          border: '#d1d9e0', // El color de  mdc-notched-outline
        },
      },
      borderRadius: {
        panel: '14px',
      },
    },
  },
  plugins: [require('prettier-plugin-tailwindcss')],
};
