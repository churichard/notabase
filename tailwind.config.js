/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    spacing: {
      ...defaultTheme.spacing,
      192: '48rem',
    },
    colors: {
      ...colors,
      primary: colors.teal,
      gray: colors.warmGray,
    },
    boxShadow: {
      ...defaultTheme.boxShadow,
      popover:
        'rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
    },
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
