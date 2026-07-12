import { createConfig } from '@kkfive/lint-config'

export default createConfig({
  appDir: new URL('.', import.meta.url).pathname,
  // Hono app 无 tailwind，跳过 eslint-plugin-tailwindcss（否则启动时找不到 tailwindcss 崩溃）
  tailwind: false,
  overrides: [
    {
      // API 端不得回退到前端/DOM 依赖；此规则是架构门禁，不能由 override 关闭。
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: ['@/components/*', '@/service/*', '@kkfive/utils/dom', 'react', 'react-dom', 'next/*'],
        }],
      },
    },
    {
      // 服务端入口：读环境变量用 process 全局、启动日志用 console 均属合理
      files: ['src/server.ts'],
      rules: {
        'node/prefer-global/process': 'off',
        'no-console': 'off',
      },
    },
  ],
})
