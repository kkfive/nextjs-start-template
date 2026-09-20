#!/usr/bin/env node
/**
 * pnpm reset —— 模板剥离脚本。
 *
 * 删除最简示例（example 四件套），把 home 收敛为空白起点，
 * 然后运行 pnpm verify 自校验。幂等：清单内已不存在的路径直接跳过。
 *
 * 用法：pnpm reset [--skip-verify]
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * 模板示例清单：删除点全部收敛于此。
 * 新增示例内容时同步维护本清单；reset-template.test.ts 守护清单不腐烂。
 */
export const TEMPLATE_EXAMPLES = [
  // client feature 四件套
  'apps/client/src/features/example',
  // 路由组合入口
  'apps/client/src/app/example',
  // api 示例端点
  'apps/api/src/routes/example.ts',
]

/** home 重写为空白起点的最小内容 */
export const BLANK_HOME = `import Link from 'next/link'

// 空白起点。接管本项目：直接改写本文件开始开发。
export function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">My Project</h1>
    </main>
  )
}
`

export async function resetTemplate({ log = () => {} } = {}) {
  let removed = 0
  for (const relativePath of TEMPLATE_EXAMPLES) {
    const target = path.join(repoRoot, relativePath)
    if (!fs.existsSync(target)) {
      log(`  skip（不存在）: ${relativePath}`)
      continue
    }
    fs.rmSync(target, { recursive: true, force: true })
    removed++
    log(`  removed: ${relativePath}`)
  }

  // home 重写为空白起点
  const homePage = path.join(repoRoot, 'apps/client/src/features/home/components/home-page.tsx')
  fs.writeFileSync(homePage, BLANK_HOME)
  log('  rewritten: apps/client/src/features/home/components/home-page.tsx（空白起点）')

  log(`\nreset 完成：删除 ${removed} 项，重写 home。`)
  return { removed, homeRewritten: true }
}

async function main() {
  const skipVerify = process.argv.includes('--skip-verify')

  await resetTemplate({ log: console.log })

  if (!skipVerify) {
    console.log('\n运行 pnpm verify 自校验…')
    try {
      execSync('pnpm verify', { cwd: repoRoot, stdio: 'inherit' })
      console.log('\n✓ verify 通过：模板剥离完成，可以开始开发。')
    }
    catch {
      console.error('\n✗ verify 失败：存在残留引用，按上方输出定位清理后重试。')
      process.exit(1)
    }
  }
}

// 直接执行时运行；被测试导入时不自动执行
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
