const sharedPlugin = '@kkfive/tailwind-config/postcss-plugin'

/**
 * 共享 PostCSS 插件配置（import + Tailwind v4 + oklab + autoprefixer）。
 * 各 app 的 postcss.config.mjs 从此处导入。
 */
export default {
  plugins: [
    [sharedPlugin, { plugin: 'postcss-import' }],
    [sharedPlugin, { plugin: '@tailwindcss/postcss' }],
    [
      sharedPlugin,
      {
        plugin: '@csstools/postcss-oklab-function',
        options: { preserve: true },
      },
    ],
    [sharedPlugin, { plugin: 'autoprefixer' }],
  ],
}
