import { callerDir, createConfig } from '@kkfive/lint-config'

const __dirname = callerDir(import.meta.url)

export default createConfig({
  appDir: __dirname,
  tailwindCssPath: 'src/styles/tailwind.css',
})
