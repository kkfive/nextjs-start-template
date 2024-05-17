const config = {
  plugins: [
    ['postcss-import', {}],
    ['tailwindcss', {}],
    ['autoprefixer', {}],
    ['postcss-mobile-forever', {
      appSelector: '#app',
      viewportWidth: (file) => {
        if (['nutui-react', 'react-vant', 'antd-mobile'].some(item => file.includes(item)))
          return 750
        return 750
      },
      desktopWidth: 750,
      maxDisplayWidth: 750,
      // selectorBlackList: [':root:root'],
    }],
  ],
}

// eslint-disable-next-line node/prefer-global/process
if (process.env.NODE_ENV === 'production')
  config.plugins.push(['cssnano', { preset: 'default' }])

module.exports = config
