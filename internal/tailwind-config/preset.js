/**
 * 共享 PostCSS 插件配置（Tailwind v4 + oklab + autoprefixer + import）。
 * 各 app 的 postcss.config.mjs 从此处导入。
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    '@csstools/postcss-oklab-function': { preserve: true },
    autoprefixer: {},
    'postcss-import': {},
  },
}
