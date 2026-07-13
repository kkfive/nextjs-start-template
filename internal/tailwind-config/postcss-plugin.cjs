const { createRequire } = require('node:module')

const requireFromConfig = createRequire(__filename)
const allowedPlugins = new Set([
  'postcss-import',
  '@tailwindcss/postcss',
  '@csstools/postcss-oklab-function',
  'autoprefixer',
])

// Next.js 仅接受字符串形式的 PostCSS 插件引用，因此在此代理中解析真实依赖。
module.exports = ({ plugin, options }) => {
  if (!allowedPlugins.has(plugin)) {
    throw new Error(`Unsupported PostCSS plugin: ${plugin}`)
  }

  const mod = requireFromConfig(plugin)
  const createPlugin = mod.default ?? mod

  return options === undefined ? createPlugin() : createPlugin(options)
}
