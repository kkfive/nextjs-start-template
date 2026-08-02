# 测试规范

## 流程边界

本文件只规定 Vitest、Testing Library 与 MSW 的项目内写法。行为变更先按 `evidence-first-development` 完成验收/证据设计和有效 RED，再使用本页实现测试；不要在此复制完整开发流程。

## 测试文件位置

```typescript
// 测试文件与源文件同目录（共享包与各 app 均如此）
// packages/utils/src/string.ts → packages/utils/src/string.test.ts
// packages/rpc/src/rpc/client.ts → packages/rpc/src/rpc/client.test.ts
// apps/client/src/lib/utils.ts → apps/client/src/lib/utils.test.ts
// apps/client/src/service/rpc-client.ts → apps/client/src/service/rpc-client.test.ts
```

## 测试框架

```typescript
// 使用 vitest + testing-library
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Mock 处理

普通 workspace package 的 Vitest 由根 `devDependencies` 提供。package manifest 需要 `test:run` 时使用 `pnpm --workspace-root exec vitest run packages/<pkg>`，不要重复声明 `vitest` 或因此修改 lockfile；依赖治理或独立发布任务除外。

```typescript
// HTTP 交互优先使用 MSW (Mock Service Worker)
// 共享 handlers：apps/{app}/src/__tests__/mocks/handlers.ts

import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/data', () => {
    return HttpResponse.json({ data: 'mocked' })
  }),
]
```

## 核心原则

- **测试文件同目录**：测试文件与源文件放在同一目录
- **使用 vitest**：项目统一使用 vitest 作为测试框架
- **按边界 mock**：HTTP 行为优先 MSW；底层 adapter contract 可 mock 最外层 IO
- **测试覆盖率**：关键业务逻辑必须有测试覆盖；coverage 只作诊断信号，不能替代行为断言、跨边界证据或独立验收
- **RED 质量**：目标测试应因缺失行为失败；环境、import、fixture、测试发现或 mock 配置错误不算有效 RED
- **断言稳定性**：取得 RED 后不得为迎合实现删除、跳过或弱化断言；需求澄清或测试缺陷必须说明

## 异步 mutation 交互测试

- 项目已声明 `@testing-library/user-event` 时，优先使用 `userEvent` 并 `await` 交互；未声明且任务不包含依赖治理时，复用 `@testing-library/react` 的 `fireEvent` 触发交互，并用 `waitFor` / `findByRole` 等等待可观察结果。普通 page / feature 测试不得仅为 interaction helper 修改 manifest、catalog 或 lockfile。
- 先断言最外层 mutation/call mock 已被调用，再等待 `role="status"` 或 `role="alert"` 等反馈，避免反馈断言掩盖 submit 未触发或 mock module identity 错误。
- 成功与失败路径都要显式配置 `QueryClientProvider`，关闭 mutation retry，并用 `waitFor` 验证 pending → success/error 的可观察状态转换。
- TanStack mutation wrapper 可能向底层 mock 传递第二个 context 参数；业务断言只约束首个 values 参数（或使用 `expect.anything()` 匹配 context），不要用单参数精确匹配误报实现失败。
