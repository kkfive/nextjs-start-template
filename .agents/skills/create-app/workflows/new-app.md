# 新建应用流程

## 前置判断

1. **先查后建**：检索 `apps/` 是否已有同类 app 或可改造的 app。方法见 `../../coding-standards/workflows/search-before-create.md`
2. **app 类型**：Next.js 客户端（client）/ Next.js 管理后台（admin）/ Hono API（api）
3. **命名**：`apps/<name>`，kebab-case，语义清晰
4. **消费的 packages**：确定要依赖哪些 `@kkfive/*`

## 步骤（Next.js app）

1. **创建目录** `apps/<name>/`
2. **写 `package.json`**：
   - `name`: `<scope>-<name>` 或保持模板命名
   - `private: true`
   - `dependencies` 声明消费的 `@kkfive/*`（`workspace:*`）+ Next/React 等
3. **写 `tsconfig.json`**：
   - `extends: @kkfive/tsconfig/nextjs.json`
   - 定义 `@/* → ./src/*`、`@domain/* → ./domain/*` 别名
4. **写 `next.config.ts`**：
   - 用 `withRepoConfig`（来自 `@kkfive/nextjs-config`）合并预设
   - 加 `transpilePackages`（消费的每个 `@kkfive/*`）
5. **写 `eslint.config.js`**：import `@kkfive/lint-config` 预设
6. **建 app 内目录**（见 `references/app-anatomy.md`）：`domain/`、`src/{app,components,lib,service,hooks,store}`
7. **建 `src/service/`** HTTP 实例：`index.client.ts`（浏览器）/ `index.server.ts`（SSR）/ `index.sse.ts`
8. **注册 workspace**：根 `tsconfig.json` references 追加；`pnpm-workspace.yaml` 通常已含 `'apps/*'`
9. **`pnpm install`** 让 workspace 链接生效
10. **建 `domain/` 适配层**：re-export `@kkfive/domain-core` 模块 + 注入 HttpService 实例 + 可选 React Query hooks
11. **生成 `apps/<name>/AGENTS.md`**：app 必定有专属约束，生成 thin-shell 格式 AGENTS.md（继承根级 + `<always-applicable>` 追加该 app 专属约束 + `<task-routing>` 路由）。参考 `apps/client/AGENTS.md` 或 `apps/admin/AGENTS.md`

## 步骤（Hono app：`apps/api`）

1. **创建目录** `apps/api/`
2. **写 `package.json`**：
   - `dependencies` 声明 `@kkfive/contracts`、`@kkfive/domain-core`、`@kkfive/utils`、`hono`
   - `scripts.dev`: `tsx watch src/app.ts`；`scripts.build`: `tsup`
3. **写 `tsconfig.json`**：`extends: @kkfive/tsconfig/hono.json`（无 DOM lib）
4. **建目录**：`domain/`（仅 re-export，无 hooks/无注入）、`src/{routes,middleware,lib}`、`src/app.ts`
5. **注册 workspace** 同上
6. **生成 `apps/api/AGENTS.md`**：thin-shell 格式，继承根级 + 追加 Hono 专属约束。参考现有 `apps/api/AGENTS.md`

## 模板：Next.js app next.config.ts

```ts
// apps/client/next.config.ts
import { withRepoConfig } from '@kkfive/nextjs-config'

export default withRepoConfig({
  transpilePackages: [
    '@kkfive/contracts',
    '@kkfive/domain-core',
    '@kkfive/http-client',
    '@kkfive/utils',
    '@kkfive/ui',
  ],
  // 该 app 专属配置
})
```

## 模板：Domain 适配层

```ts
// apps/client/domain/material/index.ts
export * from '@kkfive/domain-core/material'           // re-export 共享包
export { useMaterialList } from './hooks'              // app 专属 hooks
```

```ts
// apps/client/src/service/index.client.ts
import { HttpService } from '@kkfive/http-client'
export const httpClient = new HttpService({ /* 浏览器配置 */ })
```

## 检查

- [ ] app 不 import 其他 app（`apps/A` 不引 `apps/B`）
- [ ] tsconfig 继承 `@kkfive/tsconfig/{nextjs|hono}.json`
- [ ] Next.js app 的 `transpilePackages` 含所有消费的 `@kkfive/*`
- [ ] `domain/` 适配层只 re-export + 注入实例 + 可选 hooks，不重写核心逻辑
- [ ] `apps/api` 不注入 HttpService（同进程直调）
- [ ] 根 `tsconfig.json` references 已追加
- [ ] `pnpm install` 后 workspace 链接正常
- [ ] 已生成 `apps/<name>/AGENTS.md`（thin-shell 格式，app 必定有专属约束）
- [ ] 该 app 有独特技术栈专属 skill？（如 Hono → 建 `apps/<name>/.agents/skills/`，放该技术栈 skill。参考 `apps/api/.agents/skills/hono-api/`）
- [ ] **skill 上升检查**：新 app 是否使用了已下沉到其他包的包级专属 skill？（如新 app 也用 antd，而 ant-design 在 apps/client/.agents/skills/）→ 若是，按 `_template` 的"skill 上升"步骤把它移到根 `.agents/skills/`，让两个包共享

详细结构与配置见 `references/app-anatomy.md`，常见错误见 `references/gotchas.md`。
