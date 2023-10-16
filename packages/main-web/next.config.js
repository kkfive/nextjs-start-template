import UnoCSS from '@unocss/webpack'

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // UnoCSS Support
    config.plugins.push(UnoCSS())
    return config
  },
}

export default nextConfig
