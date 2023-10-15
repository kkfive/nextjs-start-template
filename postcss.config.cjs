/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx}'],
    },
    'autoprefixer': {},
  },
}
module.exports = config
