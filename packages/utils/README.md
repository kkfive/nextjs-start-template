# @kkfive/utils

纯工具函数包：与业务无关的通用算法。零运行时依赖。

## 作用
- 类型守卫 / 断言：`isNonNullable`、`assertNonNullable`
- Go 风格 async 错误处理：`httpTo` → `[error, data]` 元组
- 多端通用算法

## 红线
- **零运行时依赖**：可被任意环境（含 Edge 服务端 `apps/api`）消费。
- 浏览器相关工具（用 `document` / `window` / `localStorage`）必须放 `@kkfive/utils/dom`；**服务端（`apps/api`）只允许引 `@kkfive/utils/common`**——从机制上断绝边缘端解析浏览器全局变量导致的崩溃。
- 业务相关工具留各 app 的 `src/lib/`，不进此包。

## 消费方式
```ts
import { httpTo, isNonNullable } from '@kkfive/utils/common'   // 多端通用
import { copyToClipboard } from '@kkfive/utils/dom'            // 浏览器专用（前端 only）
```

> 注：`common` / `dom` 物理拆分在重构阶段 4 落地；当前为扁平导出 `@kkfive/utils`。
