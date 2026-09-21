// 批量验证恢复的 demo 页面:HTTP 状态 + 控制台错误 + 截图
import { mkdirSync } from 'node:fs'
import process from 'node:process'

import { chromium } from 'playwright'

const BASE = 'http://localhost:5373'
const PAGES = [
  '/',
  '/demo',
  '/example',
  '/demo/ui/color-palette',
  '/demo/ui/adaptive-footer',
  '/demo/pdf-viewer',
  '/demo/forms/form-validation',
  '/demo/request/basic',
  '/demo/request/auth',
  '/demo/request/config',
  '/demo/request/errors',
  '/demo/request/hitokoto',
  '/demo/request/interceptor',
  '/demo/request/sse',
  '/demo/rpc',
  '/demo/state/zustand-mouse',
]

mkdirSync('.verify-shots', { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let failed = 0
for (const path of PAGES) {
  const consoleErrors = []
  const handler = (msg) => {
    if (msg.type() === 'error')
      consoleErrors.push(msg.text().slice(0, 160))
  }
  page.on('console', handler)
  let status = 'ERR'
  try {
    const resp = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
    status = resp?.status() ?? '?'
    // 给异步渲染(动态 import / react-pdf / 请求演示)留一点时间
    await page.waitForTimeout(1200)
    const name = path.replaceAll('/', '_') || '_root'
    await page.screenshot({ path: `.verify-shots/${name}.png` })
  }
  catch (e) {
    consoleErrors.push(`NAV_FAIL: ${String(e).slice(0, 160)}`)
  }
  page.off('console', handler)

  const bad = status !== 200 || consoleErrors.some(e => !e.includes('Download the React DevTools'))
  if (bad)
    failed++
  console.log(`${bad ? 'FAIL' : 'OK  '} ${status} ${path}${consoleErrors.length ? ` | ${consoleErrors.join(' ;; ')}` : ''}`)
}

await browser.close()
console.log(failed ? `\n${failed} page(s) FAILED` : '\nALL PAGES PASSED')
process.exit(failed ? 1 : 0)
