import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflowPath = path.resolve('.github/workflows/ai-friendliness-audit.yml')

function readWorkflow(): string {
  return fs.readFileSync(workflowPath, 'utf8')
}

describe('ai friendliness audit workflow', () => {
  it('keeps expensive governance harness on schedule or manual dispatch only', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('schedule:')
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).toContain('if: github.event_name == \'schedule\' || inputs.run_e2e')
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).not.toContain('push:')
  })

  it('runs the unified deterministic gate before producing static audit artifacts', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('run: pnpm test:ai-friendliness')
    expect(workflow.indexOf('run: pnpm test:ai-friendliness')).toBeLessThan(workflow.indexOf('pnpm audit:ai-friendliness --format json'))
  })

  it('uploads a self-contained rebuild artifact with manifest, integrity, raw logs, gates and final diff inventory', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('cp -R "$artifact_dir" .artifacts/ai-friendliness/e2e-run')
    expect(workflow).toContain('test -f "$run_dir/manifest.json"')
    expect(workflow).toContain('test -f "$run_dir/integrity.json"')
    expect(workflow).toContain('test -f "$run_dir/report.json"')
    expect(workflow).toContain('find "$run_dir" -name \'*-raw.jsonl\' | grep -q .')
    expect(workflow).toContain('find "$run_dir" -name \'*-gates.json\' | grep -q .')
    expect(workflow).toContain('find "$run_dir" -name \'*-final-diff.json\' | grep -q .')
    expect(workflow).toContain('artifact-inventory.json')
  })

  it('keeps the Codex SessionStart hook repository-relative', () => {
    const hooks = fs.readFileSync(path.resolve('.codex/hooks.json'), 'utf8')

    expect(hooks).not.toContain('/Users/')
    expect(hooks).not.toContain('C:\\')
    expect(hooks).toContain('.codex/hooks/session-start')
  })

  it('uses an optional manual holdout input without putting holdouts into the default expensive run', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('holdout_profiles:')
    expect(workflow).toContain('inputs.holdout_profiles || \'\'')
    expect(workflow).toContain('prepare_args=(prepare --root .)')
    expect(workflow).toContain('prepare_args+=(--profiles "$HOLDOUT_PROFILES")')
    expect(workflow).toContain(['pnpm verify:ai-governance:prepare -- "', '{prepare_args[@]}" > .artifacts/ai-friendliness/prepare.json'].join('$'))
    expect(workflow).toContain(['Selected holdouts: `', '{{ inputs.holdout_profiles }}`'].join('$'))
    expect(workflow).toContain('remain excluded from default run/calibration')
  })

  it('restricts acceptance inputs to profiles that are pending in the technical report', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain(['const allowedEvidenceFiles = new Set(pendingProfiles.map(profile => `', '{profile}.json`))'].join('$'))
    expect(workflow).toContain('.filter(file => allowedEvidenceFiles.has(file))')
    expect(workflow).not.toContain('.filter(file => file.endsWith(\'.json\'))')
  })

  it('uses a separate independent acceptance job with explicit GitHub provenance and pending fallback', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('independent_acceptance:')
    expect(workflow).toContain('needs:\n      - governance_technical')
    expect(workflow).toContain(['ACCEPTANCE_JOB_IDENTITY: github-actions://', '{{ github.workflow }}/', '{{ github.job }}/', '{{ github.run_id }}'].join('$'))
    expect(workflow).toContain(['ACCEPTANCE_GITHUB_ACTOR: ', '{{ github.actor }}'].join('$'))
    expect(workflow).toContain(['ACCEPTANCE_GITHUB_JOB: ', '{{ github.job }}'].join('$'))
    expect(workflow).toContain(['ACCEPTANCE_GITHUB_RUN_ID: ', '{{ github.run_id }}'].join('$'))
    expect(workflow).toContain('real_acceptance_evidence_not_supplied')
    expect(workflow).toContain('status: \'pending\'')
    expect(workflow).toContain('const validateCommand = \'validate-technical\'')
  })

  it('requires the workflow to execute prepared delegate commands and propagate technical validation failures', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('bash -lc "$command"')
    expect(workflow).toContain('\'validate-technical\'')
    expect(workflow).not.toMatch(/validate-technical[^\n]*\|\|\s*true/u)
  })

  it('does not upgrade repository-supplied evidence to independently verified provenance', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('reason: \'repository_supplied_independent_provenance_rejected\'')
    expect(workflow).not.toContain('stillPending.length === 0 ? \'validate\' : \'validate-technical\'')
    expect(workflow).toContain('const validateCommand = \'validate-technical\'')
  })

  it('reports cache as configuration_verified unless real metrics are present', () => {
    const workflow = readWorkflow()

    expect(workflow).toContain('status: \'configuration_verified\'')
    expect(workflow).not.toContain('performance_verified')
  })
})
