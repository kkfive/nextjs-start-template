# @kkfive/utils

纯工具函数包：与业务无关的通用算法。按运行环境物理隔离为 `common`（多端）与 `dom`（仅浏览器），零运行时依赖。

## 目录结构

- `src/common/` —— 多端通用纯算法（服务端 + 浏览器均可安全引用，不触碰 DOM）
- `src/dom/` —— 浏览器交互工具（使用 `document` / `window` / `localStorage` 等，仅浏览器端）

## 作用

- 类型守卫 / 断言：`isNonNullable`、`assertNonNullable`（common）
- Go 风格 async 错误处理：`httpTo` → `[error, data]` 元组（common）
- 浏览器交互工具：待落地（dom 占位）

## 红线

- **零运行时依赖**：可被任意环境（含 Edge 服务端 `apps/api`）消费。
- **物理隔离**：浏览器相关工具（用 `document` / `window` / `localStorage`）只能放 `@kkfive/utils/dom`；**服务端（`apps/api`）禁止引用 `@kkfive/utils/dom`**——从机制上断绝边缘端解析浏览器全局变量导致的崩溃。服务端请用 `@kkfive/utils/common`。
- 业务相关工具留各 app 的 `src/lib/`，不进此包。

## 消费方式

```ts
import { httpTo, isNonNullable } from '@kkfive/utils/common'   // 多端通用（推荐显式）
import { copyToClipboard } from '@kkfive/utils/dom'            // 浏览器专用（前端 only）

import { isNonNullable } from '@kkfive/utils'                  // 等价于 /common，向后兼容保留
```

> `.`（根入口）是 `./common` 的向后兼容别名：等价导出多端算法、**不包含 dom**，因此服务端安全。新代码建议显式写 `/common` 或 `/dom` 以表明运行环境意图。
