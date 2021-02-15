// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {},
    colors: {
      ...colors,
      primary: colors.teal,
      blue: colors.teal,
      gray: colors.warmGray,
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
