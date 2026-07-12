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
   - 定义 `@/* → ./src/*` 别名
4. **写 `next.config.ts`**：
   - 用 `withRepoConfig`（来自 `@kkfive/nextjs-config`）合并预设
   - 加 `transpilePackages`（消费的每个 `@kkfive/*`）
5. **写 `eslint.config.js`**：import `@kkfive/lint-config` 预设
6. **建 app 内目录**（见 `references/app-anatomy.md`）：`src/{app,features,components,lib,service}`
7. **建 `src/service/` 运行时实例**（双实例）：
   - `http-client.ts`（浏览器 HttpService，`import 'client-only'`）
   - `http-server.ts`（服务端 HttpService，`import 'server-only'`）
   - `rpc-client.ts`（`createRpcClient(httpClient, baseUrl)`，`import 'client-only'`）
   - `rpc-server.ts`（`createRpcClient(httpServer, baseUrl)`，`import 'server-only'`）
   - `sse-client.ts`（SSE 实例，可选）
8. **注册 workspace**：根 `tsconfig.json` references 追加；`pnpm-workspace.yaml` 通常已含 `'apps/*'`
9. **`pnpm install`** 让 workspace 链接生效
10. **按业务建立 `src/features/<feature>/`**：放置 feature 的视图、calls、React Query hooks、状态和模型；它们调用 `@/service/*` 的客户端实例
11. **生成 `apps/<name>/AGENTS.md`**：app 必定有专属约束，生成 thin-shell 格式 AGENTS.md（继承根级 + `<always-applicable>` 追加该 app 专属约束 + `<task-routing>` 路由）。参考 `apps/client/AGENTS.md` 或 `apps/admin/AGENTS.md`

## 步骤（Hono app：`apps/api`）

1. **创建目录** `apps/api/`
2. **写 `package.json`**：
   - `dependencies` 声明 `@kkfive/contracts`、`@kkfive/utils`、`hono`
   - `scripts.dev`: `tsx watch src/app.ts`；`scripts.build`: `tsup`
3. **写 `tsconfig.json`**：`extends: @kkfive/tsconfig/hono.json`（无 DOM lib）
4. **建目录**：`src/{routes,features,middleware,lib}`、`src/app.ts`（导出 `export type AppType`）
5. **注册 workspace** 同上
6. **生成 `apps/api/AGENTS.md`**：thin-shell 格式，继承根级 + 追加 Hono 专属约束。参考现有 `apps/api/AGENTS.md`

## 模板：Next.js app next.config.ts

```ts
// apps/client/next.config.ts
import { withRepoConfig } from '@kkfive/nextjs-config'

export default withRepoConfig({
  transpilePackages: [
    '@kkfive/contracts',
    '@kkfive/http-client',
    '@kkfive/rpc',
    '@kkfive/utils',
    '@kkfive/ui',
  ],
  // 该 app 专属配置
})
```

## 模板：src/service 运行时实例

```ts
// apps/client/src/service/http-client.ts
import 'client-only'
import { HttpService } from '@kkfive/http-client'
export const httpClient = new HttpService({ prefix: '/api', /* 浏览器配置 */ })

// apps/client/src/service/rpc-client.ts
import 'client-only'
import { createRpcClient } from '@kkfive/rpc'
import { httpClient } from './http-client'
export const rpcClient = createRpcClient(httpClient, '/api')
```

## 模板：Feature hooks

```ts
// apps/client/src/features/example/hooks/use-example.ts
import { useQuery } from '@tanstack/react-query'
import { fetchExample } from '@kkfive/rpc'
import { rpcClient } from '@/service/rpc-client'
export function useExample() {
  return useQuery({ queryKey: ['example'], queryFn: () => fetchExample(rpcClient) })
}
```

## 检查

- [ ] app 不 import 其他 app（`apps/A` 不引 `apps/B`）
- [ ] tsconfig 继承 `@kkfive/tsconfig/{nextjs|hono}.json`
- [ ] Next.js app 的 `transpilePackages` 含所有消费的 `@kkfive/*`
- [ ] `src/service/` 双实例齐全：http-client/http-server + rpc-client/rpc-server
- [ ] 业务代码位于 `src/features/<feature>/`；`src/app/` 仅组合 feature 入口，`src/service/` 没有业务 calls/hooks/UI/store
- [ ] client-only / server-only 隔离正确：client 组件不引 `*-server`，server 组件不引 `*-client`
- [ ] hc 经 `createRpcClient(http, baseUrl)` 注入实例，不硬编码 baseUrl
- [ ] `apps/api` 不注入 HttpService（它是后端，不经 HTTP 调自己）
- [ ] 根 `tsconfig.json` references 已追加
- [ ] `pnpm install` 后 workspace 链接正常
- [ ] 已生成 `apps/<name>/AGENTS.md`（thin-shell 格式，app 必定有专属约束）
- [ ] 该 app 有独特技术栈专属 skill？（如 Hono → 建 `apps/<name>/.agents/skills/`，放该技术栈 skill。参考 `apps/api/.agents/skills/hono-api/`）
- [ ] **skill 上升检查**：新 app 是否使用了已下沉到其他包的包级专属 skill？（如新 app 也用 antd，而 ant-design 在 apps/client/.agents/skills/）→ 若是，按 `../_template/SKILL.md` 的"skill 上升"步骤把它移到根 `.agents/skills/`，让两个包共享

详细结构与配置见 `references/app-anatomy.md`，常见错误见 `references/gotchas.md`。
