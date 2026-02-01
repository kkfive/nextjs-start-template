# 架构文档

本文档描述项目架构和模块组织。

## 目录结构

```
├── domain/           # 业务逻辑层 (框架无关，hooks.ts 除外)
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
- **限制**: 禁止 React 组件、Next.js、UI 组件（`hooks.ts` 除外，仅限数据获取/状态逻辑，禁止 JSX/UI 渲染）
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

- **`ui/`**: 基础 UI 组件 - 透传或封装第三方 UI 库（如 antd），纯 UI 无业务逻辑
- **`common/`**: 通用功能组件 - 可复用的功能性组件，与业务场景相关但不依赖特定 domain
- **`domain/`**: 领域 UI 组件 - 结合业务逻辑与 UI

```typescript
// src/components/ui/button/index.tsx - 基础 UI（透传）
export { Button } from 'antd'
export type { ButtonProps } from 'antd'

// src/components/common/pdf-viewer/index.tsx - 通用功能组件
export function PdfViewer({ file }: PdfViewerProps) {
  // PDF 预览功能，可在多个业务场景复用
}

// src/components/domain/material/material-document-viewer.tsx - 领域 UI
import { Controller } from '@domain/material/controller'
import { PdfViewer } from '@/components/common/pdf-viewer'
import { Button } from '@/components/ui/button'

export function MaterialDocumentViewer() {
  // 结合 Material 领域逻辑 (Controller) 与通用组件 (PdfViewer, Button)
}
```

## 依赖规则

| 层级 | 可以导入 | 禁止导入 |
|------|----------|----------|
| `domain/` | `@/lib/*`、外部库、`@tanstack/react-query`（仅 hooks.ts） | `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `@domain/*`、`@/components/ui/*`、`@/components/common/*`、`@/lib/*` | 第三方 UI 库（如 antd） |
| `src/components/common/` | `@/components/ui/*`、`@/lib/*`、外部库 | `@domain/*`、业务逻辑 |
| `src/components/ui/` | 第三方 UI 库（如 antd）、外部库 | `@domain/*`、`@/components/common/*`、业务逻辑 |
| `src/app/` | `@domain/*`、`@/components/*`、`@/lib/*`、`@/hooks/*`、`@/store/*` | 第三方 UI 库（如 antd） |

**依赖流向**:

```
页面 → 领域 UI 组件 → 领域逻辑
  ↓         ↓
通用功能组件 ←─────┘
  ↓
基础 UI ←───────────┘
```

**规则**:

1. `domain/` 禁止导入 `src/`（`src/lib/*` 除外）
2. `domain/` 禁止包含 React 组件或 UI 代码（`hooks.ts` 除外，仅限数据获取/状态逻辑，禁止 JSX/UI 渲染）
3. `src/app/` 仅包含 page.tsx、layout.tsx 和路由文件
4. `src/components/domain/` 可导入 `domain/*`、`@/components/ui/*`、`@/components/common/*`
5. `src/components/common/` 不依赖特定 domain，可在多个业务场景复用
6. `src/components/ui/` 仅封装或透传第三方 UI 库，无业务逻辑
7. 所有层级必须通过 `@/components/ui/*` 使用 UI 组件，禁止直接导入第三方 UI 库
8. 所有可复用组件必须在 `src/components/`，而非 `src/app/`

## 模块组织

### 领域模块

每个领域模块遵循以下结构：

```
domain/{module}/
├── index.ts          # 统一导出
├── const/            # 常量目录（如 api.ts 定义 API 常量 + Query Keys）
├── controller.ts     # 业务逻辑编排
├── service.ts        # API 服务层
├── hooks.ts          # React Query 封装（仅限数据获取/状态逻辑，禁止 JSX/UI 渲染）
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
