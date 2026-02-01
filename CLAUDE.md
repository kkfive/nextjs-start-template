# 项目规范

Next.js 16 + React 19，三层架构 (Domain/应用/UI)。**输出语言**: 中文

## 核心约束

**架构**: `domain/` (业务逻辑，禁止 React) → `src/lib/` (基础设施) → `src/components/` (UI) → `src/app/` (路由)

**依赖**: `domain/` 仅可导入 `@/lib/*`，禁止 `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*`

**组件**: `export function Name() {}` (禁止箭头函数，仅限组件导出)

**类型**: 优先 `type` (非 interface)

**数据流**: 组件 (useQuery) → Controller → Service → HTTP

**Server/Client**: 默认 Server Component，需要交互时添加 `'use client'`

**UI 导入**: 必须通过 `@/components/ui/*` 使用 UI 组件，禁止直接导入 antd/sonner 等。例外: `ConfigProvider` 可在 `src/app/layout.tsx` 直接导入

**错误处理**: 关键业务组件使用 `<ErrorBoundary>` 包裹，防止单点故障。全局错误由 `src/app/error.tsx` 处理

## Domain 层规范（重要）

**依赖注入**: `http: HttpService` **始终作为第一个参数**，禁止直接 import 全局 http 实例

```typescript
// ✅ 正确
getList: async (http: HttpService, query?: ListQuery) => { ... }

// ❌ 错误：http 不是第一个参数
getList: async (query?: ListQuery, http: HttpService) => { ... }

// ❌ 错误：直接 import 全局实例
import { http } from '@/service/index.base'
```

**文件结构**:

```
domain/{module}/
├── const/api.ts      # API 常量 + Query Keys（函数式）
├── type.d.ts         # 类型定义（declare namespace + type）
├── service.ts        # 纯数据获取（导出 {module}Service 对象）
├── controller.ts     # 数据转换 + 业务编排（导出 {module}Controller 对象）
├── hooks.ts          # React Query 封装（内部注入 httpClient）
└── index.ts          # 统一导出
```

**Hooks 层**: 内部注入 `httpClient`（从 `@/service/index.client` 导入）

## 详细规范 (按需加载)

| 任务       | Skill                       | 覆盖                                         |
| ---------- | --------------------------- | -------------------------------------------- |
| Domain 层  | /domain-layer               | 依赖注入、Service/Controller/Hooks、命名规范 |
| 样式       | /styling-system             | ConfigProvider、CSS Variables、Tailwind      |
| 编码       | /coding-standards           | TypeScript、React、错误处理、图标            |
| 架构       | /project-architecture       | 层级、目录、命名                             |
| Next.js    | /nextjs-app-router-patterns | Server/Client Components、路由               |
| Ant Design | /ant-design                 | 组件选择、主题、SSR、**必须先查 API**        |
| 动画       | /motion                     | Motion (Framer Motion)                       |

## Git 钩子

- commit-msg: commitlint (angular preset)
- pre-commit: lint:fix + vitest --changed
