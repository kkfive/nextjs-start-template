const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-pxtorem': {
      rootValue: 32,
      propList: ['*', '!font*', '!--adm*'],
    },
    // eslint-disable-next-line node/prefer-global/process
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}

// export default config
// module.exports = config
module.exports = config
