import { callerDir, createConfig } from '@kkfive/lint-config'
import { domainBoundaryRules } from '@kkfive/lint-config/rules/domain-boundary'

const __dirname = callerDir(import.meta.url)

export default createConfig({
  appDir: __dirname,
  tailwindCssPath: 'src/styles/tailwind.css',
  overrides: [
    domainBoundaryRules({ files: ['domain/**/*.ts', 'domain/**/*.tsx'] }),
  ],
})
