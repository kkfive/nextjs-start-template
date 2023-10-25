import UnoCSS from '@unocss/webpack'
import nextPwa from 'next-pwa'

import i18n from './src/i18n-config.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // UnoCSS Support
    config.plugins.push(UnoCSS())
    return config
  },
  rewrites() {
    const source = `/:lang((?!${i18n.locales.join('|')}).*)*`
    const destination = `/${i18n.defaultLocale}/:lang*`
    return [
      { source, destination }, // match all locales except zh and en
    ]
  },
}
const withPWA = nextPwa({
  disable: require('node:process').env.NODE_ENV === 'development',
  dest: 'public',
})

export default withPWA(nextConfig)
