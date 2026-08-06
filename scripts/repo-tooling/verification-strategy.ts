export type VerificationTier = 'consumer' | 'focused' | 'global' | 'runtime'

export type VerificationRisk
  = | 'app-config'
    | 'architecture-governance'
    | 'ci-workspace'
    | 'cross-workspace'
    | 'high-consequence-runtime'
    | 'local-behavior'
    | 'public-contract'

export type VerificationStrategy = {
  commands: readonly string[]
  tiers: readonly VerificationTier[]
}

const globalRisks = new Set<VerificationRisk>([
  'architecture-governance',
  'ci-workspace',
  'cross-workspace',
  'high-consequence-runtime',
  'public-contract',
])

export function verificationStrategyFor(
  risks: readonly VerificationRisk[],
  options: { consumerCommands?: readonly string[], focusedCommands: readonly string[], runtimeCommands?: readonly string[] },
): VerificationStrategy {
  const tiers: VerificationTier[] = ['focused']
  const commands = [...options.focusedCommands]

  if ((options.consumerCommands?.length ?? 0) > 0) {
    tiers.push('consumer')
    commands.push(...options.consumerCommands!)
  }
  if (risks.some(risk => globalRisks.has(risk))) {
    tiers.push('global')
    commands.push('pnpm verify', 'pnpm test:run')
  }
  if (risks.includes('app-config') || risks.includes('high-consequence-runtime')) {
    tiers.push('runtime')
    commands.push(...(options.runtimeCommands ?? []))
  }

  return { commands: [...new Set(commands)], tiers }
}
