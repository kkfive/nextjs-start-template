import UnoCSS from '@unocss/webpack'

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

export default nextConfig
