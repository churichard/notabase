/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    spacing: {
      ...defaultTheme.spacing,
      0.25: '0.0625rem',
      128: '32rem',
      176: '44rem',
      'screen-10': '10vh',
      'screen-80': '80vh',
    },
    colors: {
      ...colors,
      primary: colors.emerald,
      gray: colors.trueGray,
    },
    boxShadow: {
      ...defaultTheme.boxShadow,
      popover:
        'rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            b: {
              fontWeight: 500,
            },
            h1: {
              fontWeight: 500,
            },
            h2: {
              fontWeight: 500,
            },
            h3: {
              fontWeight: 500,
            },
            h4: {
              fontWeight: 500,
            },
            h5: {
              fontWeight: 500,
            },
            h6: {
              fontWeight: 500,
            },
            a: {
              textDecoration: 'none',
              fontWeight: 'normal',
            },
          },
        },
      },
    },
  },
  // variants: {
  //   backgroundColor: ['responsive', 'hover', 'focus', 'active'],
  //   display: ['responsive', 'group-hover'],
  //   extend: {},
  // },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
