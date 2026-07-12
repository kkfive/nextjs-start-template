import { callerDir, createConfig } from '@kkfive/lint-config'

const __dirname = callerDir(import.meta.url)

export default createConfig({
  appDir: __dirname,
  // admin 暂未接入 tailwindcss，跳过 eslint-plugin-tailwindcss（否则启动时找不到 tailwindcss 崩溃）
  tailwind: false,
})
