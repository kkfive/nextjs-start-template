# 测试规范

## 测试文件位置

```typescript
// 测试文件与源文件同目录
// src/lib/utils.ts → src/lib/utils.test.ts
// src/components/ui/button/index.tsx → src/components/ui/button/button.test.tsx
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
// Mock 使用 MSW (Mock Service Worker)
// src/__tests__/mocks/handlers.ts

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
- **使用 MSW**：HTTP 请求 mock 使用 MSW
- **测试覆盖率**：关键业务逻辑必须有测试覆盖
