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

- **`packages/*` 里 import `apps/*`** → 共享包不依赖应用；逻辑放错位置
- **`packages/rpc` 里 import react-query/React** → 破坏框架无关性；rpc 是纯调用函数，hooks/React Query 留各 app
- **`packages/contracts` 或 `packages/utils` 引入运行时框架** → 污染所有消费方 bundle
- **app 的 `domain/` 适配层里 import `@/components/*`** → 适配层不依赖 UI
- **`src/components/ui/` 里 import `@domain/*`** → 通用 UI 不依赖业务
- **业务代码 `from 'antd'`** → 经各 app 的 `from '@/components/ui/<component>'`（antd 各 app 自治）
- **`from '@/hooks/*'` 在共享包 Service 中** → hooks 是各 app 适配层；让调用方注入

## 幽灵依赖

- **用了 package.json 未声明的包** → pnpm 严格模式下直接解析失败；新建包时 MUST 完整填写 dependencies / peerDependencies / devDependencies
- **跨包版本漂移** → 用 syncpack 检测；统一版本通过根 package.json 或 syncpack config 管理

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
