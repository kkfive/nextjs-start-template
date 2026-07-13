import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  dts: false,
  deps: {
    // 部署产物必须包含 workspace 源码；第三方运行时依赖仍由 node_modules 提供。
    alwaysBundle: [/^@kkfive\//],
    // contracts 的运行时校验依赖必须随 workspace 源码内联，其他第三方依赖保持外部化。
    onlyBundle: ['zod'],
  },
})
