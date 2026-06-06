# Gotchas

## 类型

- **`interface` 与 `type` 混用** → 项目统一 `type`；`interface` 仅在需要声明合并时
- **`any` / `as any` / `@ts-ignore`** → 不许；必要时用 `as unknown as X` 并加注释解释为何安全
- **类型在 `index.ts` 暴露不完整** → `export type * from './type'` 一次全暴露
- **导出业务类型时用 `export *`** → 必须用 `export type *` 才会被 erasable types 正确处理

## React 组件

- **箭头函数定义组件** → 用 `export function Name() {}`（可搜索、可重构、栈追踪友好）
- **Server Component 里写 `useState`** → 必须加 `'use client'` 或下沉
- **`'use client'` 加在根 layout** → 整页转 Client；下沉到最小子组件
- **`'use client'` 文件里 `await getData()`** → Client 不能直接 await 数据；用 React Query / Server Action

## Import 黑名单

- **`domain/` 里 import `@/components/*`** → 反向依赖；删除并把 UI 逻辑放到调用方
- **`src/components/ui/` 里 import `@domain/*`** → 通用 UI 不依赖业务
- **业务代码 `from 'antd'`** → `from '@/components/ui/<component>'`
- **`from '@/hooks/*'` 在 Domain Service 中** → hooks 是适配层；让调用方注入

## 错误处理

- **裸 `throw new Error('...')`** → 用 `ApiError` / `AppError` / `ValidationError`
- **空 `catch {}`** → 至少 log，最好转换为业务错误
- **Server Action 里 throw 给客户端** → 返回 `{ error: '...' }` 而非 throw（除非致命）

## 测试

- **直接 mock 全局 `fetch`** → 用 MSW 拦截，更接近真实
- **mock 太深（mock 整个模块）** → mock 最外层 IO（如 http），让被测代码完整跑
- **跳过失败测试** → 不允许；修代码或修测试，不允许 `.skip`

## 图标

- **直接 import SVG** → 用 Iconify Web Component 或项目封装
- **图标颜色硬编码** → 用 `currentColor` 或 CSS Variables
