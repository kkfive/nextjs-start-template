# 文件约定

App Router 通过文件名声明路由元素。

## 文件名映射

| 文件 | 作用 | 是否必须 |
|---|---|---|
| `page.tsx` | 路由 UI（叶子节点） | 是（无 page 即非可访问路由） |
| `layout.tsx` | 子树共享 UI（持久挂载） | 否 |
| `loading.tsx` | 自动 Suspense fallback | 否 |
| `error.tsx` | 错误边界（必须 `'use client'`） | 否 |
| `not-found.tsx` | 404 UI | 否 |
| `template.tsx` | 类 layout，但重新挂载（不复用状态） | 极少需要 |
| `default.tsx` | 并行路由 fallback | 用并行路由时需要 |
| `route.ts` | API 端点（不能与 page 同名同目录） | 否 |
| `opengraph-image.tsx` | 动态 OG 图 | 否 |
| `sitemap.ts` / `robots.ts` | SEO | 否 |

## 路由组与并行/拦截

| 模式 | 含义 |
|---|---|
| `(name)` | 路由组：不影响 URL，仅做组织 |
| `@slot` | 并行路由：同一 layout 接收多个子树 |
| `(.)foo` | 拦截路由：同层级拦截 `/foo` |
| `(..)foo` | 拦截：上一层 |
| `(...)foo` | 拦截：从 root |
| `[id]` | 动态段 |
| `[...slug]` | catch-all |
| `[[...slug]]` | optional catch-all |

## 推荐目录结构

每个 Next.js app 的路由根目录是 `apps/{app}/src/app/`：

```
apps/client/src/app/
├── (marketing)/         # 营销路由组
│   ├── page.tsx
│   └── about/page.tsx
├── (app)/               # 登录后路由组
│   ├── layout.tsx       # 应用 layout
│   ├── dashboard/page.tsx
│   └── settings/page.tsx
├── api/                 # 轻量 BFF（Route Handlers）
│   └── materials/route.ts
└── actions/             # Server Actions
    └── material.ts
```

> 真正的后端业务 API 在 `apps/api`（Hono）；`src/app/api/` 仅承担轻量 BFF。

## 反例

- ❌ 在 `src/app/` 下放可复用组件 → 下沉到该 app 的 `src/components/`
- ❌ 在 page 里写 Domain 业务 → 通过 `@kkfive/rpc` 的 calls（经该 app `src/service` 的 rpc 实例）调用
- ❌ 同一目录既有 `page.tsx` 又有 `route.ts` → Next 报冲突
