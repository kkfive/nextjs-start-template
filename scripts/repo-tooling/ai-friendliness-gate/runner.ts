#!/usr/bin/env node

import type { AiFriendlinessCheckResult, AiFriendlinessCheckStatus, AiFriendlinessGateReport } from './contract.ts'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { aggregateAiFriendlinessChecks, aiFriendlinessCheckDefinitions } from './contract.ts'

export type AiFriendlinessGateOptions = {
  acceptanceEvidence?: string
  execute?: (command: readonly string[]) => number | null
  technicalEvidence?: string
}

export function runAiFriendlinessGate(options: AiFriendlinessGateOptions = {}): AiFriendlinessGateReport {
  const execute = options.execute ?? executeCommand
  const checks: AiFriendlinessCheckResult[] = []

  for (const definition of aiFriendlinessCheckDefinitions) {
    if (definition.defaultMode === 'always') {
      const status = execute(definition.command!) === 0 ? 'passed' : 'failed'
      checks.push({ command: definition.command, id: definition.id, status })
      if (status === 'failed')
        break
      continue
    }

    const evidencePath = definition.id === 'real-agent-technical' ? options.technicalEvidence : options.acceptanceEvidence
    checks.push({
      command: null,
      id: definition.id,
      status: readExternalStatus(evidencePath, definition.id === 'real-agent-technical' ? 'technical' : 'acceptance'),
    })
  }

  for (const definition of aiFriendlinessCheckDefinitions) {
    if (!checks.some(check => check.id === definition.id))
      checks.push({ command: definition.command, id: definition.id, status: 'not_run' })
  }
  return aggregateAiFriendlinessChecks(checks)
}

export function renderAiFriendlinessGate(report: AiFriendlinessGateReport, format: 'json' | 'markdown'): string {
  if (format === 'json')
    return `${JSON.stringify(report, null, 2)}\n`
  return [
    '',
    '# AI Friendliness Gate',
    '',
    ...report.checks.map(check => `- ${check.id}: **${check.status}**`),
    `- verdict: **${report.verdict}**`,
    '',
  ].join('\n')
}

function executeCommand(command: readonly string[]): number | null {
  const [executable, ...args] = command
  return spawnSync(executable, args, { encoding: 'utf8', stdio: 'inherit' }).status
}

function executeCommandQuietly(command: readonly string[]): number | null {
  const [executable, ...args] = command
  return spawnSync(executable, args, { encoding: 'utf8', stdio: 'ignore' }).status
}

function readExternalStatus(file: string | undefined, kind: 'acceptance' | 'technical'): AiFriendlinessCheckStatus {
  if (!file)
    return 'not_run'
  const absolute = path.resolve(file)
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile())
    return 'infrastructure_error'
  try {
    const value = JSON.parse(fs.readFileSync(absolute, 'utf8')) as Record<string, unknown>
    if (kind === 'technical') {
      if (value.status === 'passed' || value.status === 'technical_passed')
        return 'passed'
      if (value.status === 'infrastructure_error')
        return 'infrastructure_error'
      return 'failed'
    }
    if (value.status === 'independently_verified' || value.status === 'passed')
      return 'passed'
    if (value.status === 'pending' || value.status === 'acceptance_pending')
      return 'acceptance_pending'
    if (value.status === 'infrastructure_error')
      return 'infrastructure_error'
    return 'failed'
  }
  catch {
    return 'infrastructure_error'
  }
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  return index < 0 ? undefined : args[index + 1]
}

function main(): void {
  const args = process.argv.slice(2)
  const format = option(args, '--format') ?? 'markdown'
  if (format !== 'json' && format !== 'markdown') {
    process.stderr.write(`Unsupported format: ${format}\n`)
    process.exit(2)
  }
  const report = runAiFriendlinessGate({
    acceptanceEvidence: option(args, '--acceptance-evidence'),
    execute: format === 'json' ? executeCommandQuietly : undefined,
    technicalEvidence: option(args, '--technical-evidence'),
  })
  process.stdout.write(renderAiFriendlinessGate(report, format))
  process.exitCode = report.verdict === 'failed' ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main()
