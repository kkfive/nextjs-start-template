/** @type {import('postcss-load-config').Config} */
const config = {
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  plugins: {
    '@unocss/postcss': {
      // Optional
      content: ['**/*.{html,js,ts,jsx,tsx}'],
    },
    'autoprefixer': {},
  },

}
module.exports = config
