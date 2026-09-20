import type { ExecException } from 'node:child_process'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BLANK_HOME, repoRoot, REWRITE_TARGETS, TEMPLATE_EXAMPLES } from '../../reset-template.mjs'

describe('reset-template manifest guard', () => {
  it('清单内每个路径都真实存在（防模板演进后清单腐烂）', () => {
    for (const relativePath of TEMPLATE_EXAMPLES) {
      expect(fs.existsSync(path.join(repoRoot, relativePath)), `清单项不存在: ${relativePath}`).toBe(true)
    }
  })

  it('重写目标文件都真实存在', () => {
    for (const { path: relativePath } of REWRITE_TARGETS) {
      expect(fs.existsSync(path.join(repoRoot, relativePath)), `重写目标不存在: ${relativePath}`).toBe(true)
    }
  })

  it('清单路径与重写目标全部位于 apps/，不允许误删骨架（packages/internal/scripts）', () => {
    for (const relativePath of [...TEMPLATE_EXAMPLES, ...REWRITE_TARGETS.map(target => target.path)]) {
      expect(relativePath.startsWith('apps/'), `越界清单项: ${relativePath}`).toBe(true)
    }
  })

  it('清单去重且非空', () => {
    expect(TEMPLATE_EXAMPLES.length).toBeGreaterThan(0)
    expect(new Set(TEMPLATE_EXAMPLES).size).toBe(TEMPLATE_EXAMPLES.length)
  })

  it('空白 home 内容无 TypeScript 语法错误（孤立 tsc 无法解析 JSX 类型，仅拒绝 TS1xxx 语法错误）', () => {
    const tempDir = fs.mkdtempSync(path.join(repoRoot, 'node_modules/.tmp-reset-'))
    try {
      const tempFile = path.join(tempDir, 'home-page.tsx')
      fs.writeFileSync(tempFile, BLANK_HOME)
      let stderr = ''
      try {
        execSync(
          `npx tsc --ignoreConfig --noEmit --skipLibCheck --jsx preserve --target es2022 --moduleResolution bundler --module esnext "${tempFile}"`,
          { cwd: repoRoot, stdio: 'pipe' },
        )
      }
      catch (error) {
        const execError = error as ExecException & { stderr?: string | Uint8Array }
        stderr = execError.stderr ? String(execError.stderr) : ''
      }
      // 语义错误（模块解析 TS2307、JSX 类型 TS7026）在孤立编译下必然出现，忽略；
      // 语法错误（TS1xxx）表示 BLANK_HOME 模板损坏，必须失败。
      const syntaxErrors = stderr.split('\n').filter(line => /error TS1\d{3}:/.test(line))
      expect(syntaxErrors, `空白 home 模板存在语法错误:\n${syntaxErrors.join('\n')}`).toEqual([])
    }
    finally {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
