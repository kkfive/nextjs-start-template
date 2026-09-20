# Gotchas

机器已拦截的不再列出（import 方向、透传层、`@ts-ignore`、`any`、空 `catch`、图标库、版本漂移、文件名 kebab-case 分别由 FFG01-07 / eslint / syncpack 强制）。以下均为机器判不了的语义陷阱。

## React 组件

- **箭头函数定义公共组件** → 用 `export function Name() {}`（可搜索、可重构、栈追踪友好）
- **`'use client'` 加在根 layout** → 整页转 Client；下沉到最小子组件
- **`'use client'` 文件里 `await getData()`** → Client 不能直接 await 数据；用 React Query / Server Action

## 错误处理

- **裸 `throw new Error('...')`** → 用各 app `src/lib/errors/` 的 `ApiError` / `AppError` / `ValidationError`
- **Server Action 里 throw 给客户端** → 返回 `{ error: '...' }` 而非 throw（除非致命）

## 测试

- **HTTP 行为测试直接替换整条业务链** → 优先 MSW；adapter contract test 可 mock 最外层 `HttpService.request`，避免固定端口
- **mock 太深（mock 整个模块）** → mock 最外层 IO（如 http），让被测代码完整跑
- **跳过失败测试** → 不允许；修代码或修测试，不允许 `.skip`

## 图标

- **图标颜色硬编码** → 用 `currentColor` 或 CSS Variables
