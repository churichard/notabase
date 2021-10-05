/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        0.25: '0.0625rem',
        128: '32rem',
        160: '40rem',
        176: '44rem',
        192: '48rem',
        240: '60rem',
        'screen-10': '10vh',
        'screen-80': '80vh',
      },
      colors: {
        primary: colors.emerald,
        gray: colors.trueGray,
        orange: colors.orange,
      },
      boxShadow: {
        popover:
          'rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px',
      },
      opacity: {
        0.1: '0.001',
        85: '.85',
      },
      zIndex: {
        '-10': '-10',
      },
      cursor: {
        alias: 'alias',
      },
      animation: {
        'bounce-x': 'bounce-x 1s infinite',
      },
      keyframes: {
        'bounce-x': {
          '0%, 100%': {
            transform: 'translateX(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateX(25%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            b: {
              fontWeight: 600,
            },
            h1: {
              fontWeight: 600,
            },
            h2: {
              fontWeight: 600,
            },
            h3: {
              fontWeight: 600,
            },
            h4: {
              fontWeight: 600,
            },
            h5: {
              fontWeight: 600,
            },
            h6: {
              fontWeight: 600,
            },
            a: {
              textDecoration: 'none',
              fontWeight: 'normal',
              '&:hover': {
                color: colors.emerald[500],
              },
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
