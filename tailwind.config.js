module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
