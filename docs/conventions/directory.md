# 目录约定

## 根目录结构

```
├── domain/           # 业务逻辑层 (框架无关)
├── src/              # 应用层 (Next.js)
├── docs/             # 文档
├── public/           # 静态资源
├── typings/          # 全局类型定义
└── data/             # 静态数据文件
```

## 领域层 (`domain/`)

```
domain/
├── {module}/              # 业务模块
│   ├── index.ts           # 统一导出
│   ├── controller.ts      # 业务逻辑编排
│   ├── service.ts         # API 服务层
│   ├── type.d.ts          # 类型定义
│   ├── schema.ts          # Zod schemas (可选)
│   └── const/             # 常量 (如 api.ts)
└── _shared/               # 共享工具 (下划线前缀表示内部模块)
    ├── types/
    └── utils/
```

**规则**:
- 每个模块必须有 `index.ts` 作为唯一出口
- `_shared/` 前缀表示跨模块共享的内部代码

## 应用层 (`src/`)

```
src/
├── app/                   # Next.js App Router
│   ├── {route}/
│   │   ├── page.tsx       # 页面组件
│   │   └── layout.tsx     # 布局组件
│   └── api/               # API 路由
│       └── {endpoint}/
│           └── route.ts
├── components/
│   ├── ui/                # 基础 UI (shadcn)
│   ├── domain/            # 领域 UI (结合业务逻辑)
│   │   └── {module}/
│   ├── {feature}/         # 功能特定组件
│   └── providers.tsx      # 全局 Providers
├── hooks/                 # React Hooks
├── lib/                   # 工具库
│   ├── request/           # HTTP 客户端
│   ├── errors/            # 错误处理
│   └── utils.ts           # 通用工具
├── store/                 # Zustand stores
├── config/                # 应用配置
├── service/               # HTTP 服务实例
└── __tests__/             # 测试工具和 mocks
```

## 文件放置规则

| 文件类型 | 位置 | 示例 |
|----------|------|------|
| 页面组件 | `src/app/{route}/page.tsx` | `src/app/demo/page.tsx` |
| API 路由 | `src/app/api/{endpoint}/route.ts` | `src/app/api/revalidate/route.ts` |
| 基础 UI | `src/components/ui/{component}/` | `src/components/ui/button/` |
| 领域 UI | `src/components/domain/{module}/` | `src/components/domain/hitokoto/` |
| 业务逻辑 | `domain/{module}/` | `domain/example/hitokoto/` |
| React Hook | `src/hooks/use-{name}.ts` | `src/hooks/use-mobile.ts` |
| Zustand Store | `src/store/{name}-store.ts` | `src/store/mouse-store.ts` |
| 测试文件 | 与源文件同目录 `{name}.test.ts` | `src/lib/utils.test.ts` |
