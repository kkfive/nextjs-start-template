import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // domain-core 是框架无关的纯逻辑，无需 jsdom
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
})
