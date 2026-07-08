import { createConfig } from '@kkfive/lint-config'
import { domainBoundaryRules } from '@kkfive/lint-config/rules/domain-boundary'

export default createConfig({
  appDir: new URL('.', import.meta.url).pathname,
  // Hono app 无 tailwind，关闭 tailwind plugin 相关
  overrides: [
    domainBoundaryRules({ files: ['domain/**/*.ts'] }),
    {
      // api 是后端，无 jsx/dom，放宽 nextjs 相关规则
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
})
