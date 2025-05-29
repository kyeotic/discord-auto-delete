/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/public/index.html',
    './src/client/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}',
  ],
  // safelist: [{ pattern: /grid-cols-./ }],

  darkMode: 'class',
  theme: {
    extend: {},
  },
  // variants: {
  //   opacity: ({ after }) => after(['disabled']),
  // },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-safe-area')],
}
