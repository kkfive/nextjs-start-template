import { describe, expect, it } from 'vitest'
import { verificationStrategyFor } from './verification-strategy.ts'

describe('risk-based verification strategy', () => {
  it('keeps a local behavior change focused when no wider risk is declared', () => {
    expect(verificationStrategyFor(['local-behavior'], { focusedCommands: ['pnpm --filter client test:run'] })).toEqual({
      commands: ['pnpm --filter client test:run'],
      tiers: ['focused'],
    })
  })

  it('adds consumers and global gates for public cross-workspace contracts', () => {
    expect(verificationStrategyFor(['public-contract', 'cross-workspace'], {
      consumerCommands: ['pnpm --filter client test:run'],
      focusedCommands: ['pnpm --filter @kkfive/http-client test:run'],
    })).toEqual({
      commands: [
        'pnpm --filter @kkfive/http-client test:run',
        'pnpm --filter client test:run',
        'pnpm verify',
        'pnpm test:run',
      ],
      tiers: ['focused', 'consumer', 'global'],
    })
  })

  it('adds runtime evidence for app configuration changes without duplicating commands', () => {
    expect(verificationStrategyFor(['app-config'], {
      focusedCommands: ['pnpm --filter client test:run'],
      runtimeCommands: ['pnpm --filter client build', 'pnpm --filter client test:run'],
    })).toEqual({
      commands: ['pnpm --filter client test:run', 'pnpm --filter client build'],
      tiers: ['focused', 'runtime'],
    })
  })
})
