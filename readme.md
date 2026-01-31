# Next.js Start Template

基于 Next.js 16 + React 19 的项目模板，采用领域驱动三层架构。

## 特性

- **Next.js 16** + **React 19** - 最新框架版本
- **领域驱动架构** - 业务逻辑与 UI 分离，框架无关
- **TypeScript 5.9** - 完整类型支持
- **Tailwind CSS 4** - 原子化 CSS
- **TanStack Query** - 服务端状态管理
- **Zustand** - 客户端状态管理
- **Vitest + MSW** - 单元测试与 API Mock
- **ESLint + commitlint** - 代码规范与提交规范

## 快速开始

### 1. 克隆模板

```bash
git clone https://github.com/kkfive/nextjs-start-template.git my-project
cd my-project
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 清理示例代码

运行以下命令删除示例代码，保留干净的项目骨架：

```bash
# 删除示例业务模块
rm -rf domain/example

# 删除示例 UI 组件
rm -rf src/components/domain/hitokoto
rm -rf src/components/domain/request
rm -rf src/components/demo
rm -rf src/components/home

# 删除示例页面
rm -rf src/app/demo

# 清理首页（可选，保留则需修改）
# rm src/app/page.tsx
```

### 4. 重置 Git 历史（可选）

```bash
rm -rf .git
git init
git add .
git commit -m "feat: 初始化项目"
```

### 5. 启动开发

```bash
pnpm dev
```

访问 http://localhost:5373

## 项目结构

```
├── domain/           # 业务逻辑层 (框架无关)
│   └── {module}/     # 业务模块 (controller/service/type.d.ts)
├── src/
│   ├── app/          # 页面路由 (仅 page/layout/route)
│   ├── components/
│   │   ├── ui/       # 基础 UI (shadcn)
│   │   └── domain/   # 领域 UI (结合业务逻辑)
│   ├── lib/          # 基础设施 (HTTP、工具函数)
│   ├── hooks/        # React Hooks
│   └── store/        # Zustand stores
└── docs/             # 文档
```

## 常用命令

| 命令                 | 说明                       |
| -------------------- | -------------------------- |
| `pnpm dev`           | 启动开发服务器 (port 5373) |
| `pnpm build`         | 构建生产版本               |
| `pnpm lint:fix`      | ESLint 检查并修复          |
| `pnpm test:run`      | 运行测试                   |
| `pnpm test:coverage` | 运行测试并生成覆盖率报告   |

## 架构约定

### 依赖规则

| 层级                     | 可以导入                         | 禁止导入                                   |
| ------------------------ | -------------------------------- | ------------------------------------------ |
| `domain/`                | `@/lib/*`、外部库                | `@/components/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `@domain/*`、`@/components/ui/*` | -                                          |
| `src/components/ui/`     | 外部库                           | `@domain/*`、业务逻辑                      |

### 数据流模式

```
组件 (useQuery) → Domain Controller → Service → HTTP
```

详细架构文档见 `docs/architecture.md`

## 创建新模块

### 1. 创建领域模块

```bash
mkdir -p domain/user
```

```typescript
// domain/user/service.ts
import type { HttpService } from '@/lib/request'

import { service } from './service'

export class Controller {
  static async getUser(http: HttpService, id: string) {
    return service.getUser(http, id)
  }
}

export const service = {
  async getUser(http: HttpService, id: string) {
    return http.get(`/api/users/${id}`).json()
  }
}

// domain/user/index.ts
export { Controller } from './controller'
export { service } from './service'
```

### 2. 创建领域 UI 组件

```tsx
// src/components/domain/user/user-card.tsx
'use client'

import { Controller } from '@domain/user'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { http } from '@/service/index.base'

export function UserCard({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => Controller.getUser(http, userId),
  })

  if (isLoading)
    return <div>Loading...</div>

  return (
    <Card>
      <h2>{data?.name}</h2>
    </Card>
  )
}
```

## 文档

- [架构文档](docs/architecture.md)
- [目录约定](docs/conventions/directory.md)
- [命名规范](docs/conventions/naming.md)
- [编码规范](docs/conventions/coding.md)

## License

[MIT](https://github.com/kkfive/nextjs-start-template/blob/master/LICENSE)
