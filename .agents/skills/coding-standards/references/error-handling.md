# 错误处理规范

## 使用项目定义的错误类

错误类定义在各 app 的 `src/lib/errors/`（错误类有 throw/instanceof 行为，不放 `@kkfive/contracts`；契约包只放错误响应数据形状 `ErrorResponseSchema`）。

```typescript
// 各 app 内导入错误类
import { ApiError, AppError, ValidationError } from '@/lib/errors'

// API 错误处理
try {
  const data = await service.getData(http)
}
catch (error) {
  if (error instanceof ApiError) {
    // 处理 API 错误
    console.error('API Error:', error.message)
  }
  throw error
}
```

## 错误类型

`ApiError`（HTTP 4xx/5xx）、`AppError`（业务规则违反）、`ValidationError`（数据验证失败）；定义见各 app `src/lib/errors/`。

## 核心原则

- **使用类型化错误**：避免通用 `Error`，捕获后重新抛出由上层处理
