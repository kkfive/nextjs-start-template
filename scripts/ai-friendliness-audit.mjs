#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { renderAuditMarkdown, runStaticAudit } from './repo-tooling/ai-friendliness-audit/static-audit.ts'

const args = process.argv.slice(2)
const command = args[0] && !args[0].startsWith('-') ? args.shift() : 'static'
const passthroughSeparator = args.indexOf('--')
if (passthroughSeparator !== -1)
  args.splice(passthroughSeparator, 1)

if (command !== 'static') {
  console.error(`Unknown command: ${command}`)
  process.exit(2)
}

const rootDir = path.resolve(option('--root') ?? process.cwd())
const format = option('--format') ?? 'markdown'
const output = option('--output')

if (!['json', 'markdown'].includes(format)) {
  console.error(`Unsupported format: ${format}`)
  process.exit(2)
}

const report = runStaticAudit({ rootDir })
const rendered = format === 'json' ? `${JSON.stringify(report, null, 2)}\n` : renderAuditMarkdown(report)

if (output) {
  const outputPath = path.resolve(output)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, rendered)
}
else {
  process.stdout.write(rendered)
}

process.exitCode = report.verdict === 'passed' ? 0 : 1

function option(name) {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}
