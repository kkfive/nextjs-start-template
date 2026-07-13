const repoTranspilePackages = [
  '@kkfive/contracts',
  '@kkfive/rpc',
  '@kkfive/http-client',
  '@kkfive/utils',
  '@kkfive/ui',
]

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
    // create 命令把新 source-consumed package 写入 userTranspile；这里统一去重派生。
    transpilePackages: [...new Set([...repoTranspilePackages, ...userTranspile])],
    sassOptions: {
      ...userSass,
    },
  }
}

export { repoTranspilePackages, withRepoConfig }
export default withRepoConfig
