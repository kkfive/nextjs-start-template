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

| 错误类 | 用途 | 示例 |
|--------|------|------|
| `ApiError` | API 请求错误 | HTTP 4xx/5xx 错误 |
| `AppError` | 应用逻辑错误 | 业务规则违反 |
| `ValidationError` | 数据验证错误 | 表单验证失败 |

## 核心原则

- **使用类型化错误**：避免使用通用 Error
- **错误传播**：捕获后重新抛出，让上层处理
- **错误日志**：记录错误信息用于调试
- **用户友好**：向用户展示可理解的错误消息
