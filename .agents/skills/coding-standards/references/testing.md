# 测试规范

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
- **测试覆盖率**：关键业务逻辑必须有测试覆盖
