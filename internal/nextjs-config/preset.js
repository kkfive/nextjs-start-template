/**
 * withRepoConfig —— 共享 Next.js 配置工厂。
 *
 * 各 Next.js app 的 next.config.ts 通过合并本工厂的共享配置 + app 专属配置：
 *
 * ```ts
 * import { withRepoConfig } from '@kkfive/nextjs-config'
 * export default withRepoConfig({ /* app 专属 *\/ })
 * ```
 *
 * 共享配置包括：transpilePackages（消费的 @kkfive/*）、sassOptions 等。
 */
function withRepoConfig(userConfig = {}) {
  const {
    transpilePackages: userTranspile = [],
    sassOptions: userSass = {},
    ...rest
  } = userConfig

  return {
    ...rest,
    // 消费的 workspace 包源码（Phase 2 后各 app 按需补全）
    transpilePackages: [
      '@kkfive/contracts',
      '@kkfive/domain-core',
      '@kkfive/http-client',
      '@kkfive/utils',
      '@kkfive/ui',
      ...userTranspile,
    ],
    sassOptions: {
      ...userSass,
    },
  }
}

export { withRepoConfig }
export default withRepoConfig
