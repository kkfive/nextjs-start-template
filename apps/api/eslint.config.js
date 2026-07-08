import { createConfig } from '@kkfive/lint-config'
import { domainBoundaryRules } from '@kkfive/lint-config/rules/domain-boundary'

export default createConfig({
  appDir: new URL('.', import.meta.url).pathname,
  // Hono app 无 tailwind，跳过 eslint-plugin-tailwindcss（否则启动时找不到 tailwindcss 崩溃）
  tailwind: false,
  overrides: [
    domainBoundaryRules({ files: ['domain/**/*.ts'] }),
    {
      // api 是后端，无 jsx/dom，放宽 nextjs 相关规则
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      // 服务端入口：读环境变量用 process 全局、启动日志用 console 均属合理
      files: ['src/app.ts'],
      rules: {
        'node/prefer-global/process': 'off',
        'no-console': 'off',
      },
    },
  ],
})
