# 架构文档

本文档描述项目架构和模块组织。

## 目录结构

```
├── domain/           # 业务逻辑层 (框架无关，禁止 React)
│   ├── {module}/     # 业务模块 (controller/service/type.d.ts)
│   └── _shared/      # 共享工具 (下划线前缀 = 内部模块)
├── src/              # 应用层 (Next.js)
│   ├── app/          # 页面路由 (仅 page/layout/route)
│   ├── components/   # UI 组件 (ui/ + domain/)
│   ├── lib/          # 基础设施 (HTTP、工具函数)
│   ├── hooks/        # React Hooks
│   └── store/        # Zustand stores
└── docs/             # 文档
```

> 详细目录约定见 `docs/conventions/directory.md`

## 层级分离

### 领域层 (`domain/`)

领域层包含**纯业务逻辑**，**框架无关**：

- **职责**: 业务逻辑编排、API 服务、数据 Schema、类型定义
- **依赖**: 仅 `src/lib/*` 抽象层和外部库 (zod 等)
- **限制**: 禁止 React、Next.js、UI 组件
- **导出**: Controller、Service、Schema、Type

**核心原则**: 领域层必须保持框架无关，确保可移植性和可测试性。

```typescript
// domain/example/hitokoto/controller.ts
import type { HttpService } from '@/lib/request'

export class Controller {
  static async getData(client: HttpService) {
    const result = await service.getData(client)
    return result
  }
}
```

### 应用层 (`src/`)

应用层包含 Next.js 特定代码，按职责组织：

#### 页面 (`src/app/`)

- **职责**: Next.js App Router 页面和路由
- **内容**: 仅 page.tsx、layout.tsx 和路由相关文件
- **限制**: 禁止可复用组件（移至 `src/components/`）

#### 组件 (`src/components/`)

- **`ui/`**: 基础 UI 组件 (shadcn) - 全局可复用
- **`domain/`**: 领域 UI 组件 - 结合业务逻辑与 UI

```typescript
// src/components/domain/hitokoto/hitokoto-card.tsx
import { Controller } from '@domain/example/hitokoto/controller'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function HitokotoCard() {
  // 结合领域逻辑 (Controller) 与 UI (Button, Card)
}
```

## 依赖规则

| 层级 | 可以导入 | 禁止导入 |
|------|----------|----------|
| `domain/` | `@/lib/*`、外部库 | `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `@domain/*`、`@/components/ui/*`、`@/lib/*` | - |
| `src/components/ui/` | 外部库 | `@domain/*`、业务逻辑 |
| `src/app/` | 所有 | - |

**依赖流向**:

```
页面 → 领域 UI 组件 → 领域逻辑
  ↓         ↓
基础 UI ←───┘
```

**规则**:

1. `domain/` 禁止导入 `src/`（`src/lib/*` 除外）
2. `domain/` 禁止包含 React 组件或 UI 代码
3. `src/app/` 仅包含 page.tsx、layout.tsx 和路由文件
4. `src/components/domain/` 可导入 `domain/*` 和 `src/components/ui/*`
5. 所有可复用组件必须在 `src/components/`，而非 `src/app/`

## 模块组织

### 领域模块

每个领域模块遵循以下结构：

```
domain/{module}/
├── index.ts          # 统一导出
├── controller.ts     # 业务逻辑编排
├── service.ts        # API 服务层
├── type.d.ts         # TypeScript 类型
└── schema.ts         # Zod schemas (可选)
```

### UI 组件

#### 基础 UI (`src/components/ui/`)

```
src/components/ui/{component}/
├── index.tsx         # 组件实现
└── {component}.test.tsx  # 测试
```

#### 领域 UI (`src/components/domain/`)

```
src/components/domain/{module}/
└── {component}.tsx   # 结合领域逻辑与 UI 的组件
```

## 路径别名

配置于 `tsconfig.json`：

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@domain/*": ["./domain/*"]
  }
}
```

## 测试策略

- **单元测试**: 纯函数、Schema、工具函数
- **组件测试**: React 组件 + Testing Library
- **集成测试**: API 路由、数据获取
- **Mock**: MSW 处理 HTTP 请求

详见 `src/__tests__/` 测试工具和 mock 配置。
