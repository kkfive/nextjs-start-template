# apps/client 协作准则（主应用 Next.js）

`apps/client` 是主应用（Next.js App Router），面向终端用户，也可通过 `src/app/api/` 提供轻量 BFF 聚合/转发。

继承根 `AGENTS.md` 全部规则，补充本 app 专属约束。与根级冲突时以根级硬性约束为准。

<always-applicable>

## 关键约束

### Feature-first

- 业务视图、calls、React Query hooks、页面模型、store 和 feature 内测试归入 `src/features/<feature>/`
- `src/app/` 的页面和 layout 只组合 feature 入口、路由元数据与 Next.js 路由能力
- `src/service/` 仅保存 HTTP、RPC、SSE 运行时实例；不得放业务 calls、hooks、组件或状态

### antd 自治

- antd 及 `@ant-design/*` 在 client 内自行安装与配置，**不进 `@kkfive/ui`**
- ConfigProvider / theme token 在 `src/components/providers.tsx` 自治，避免与 `@kkfive/ui` 体系冲突
- 基于 antd 的跨 feature 封装留在 `src/components/`，feature 专属封装留在所属 feature

### 运行时实例

- `http-client.ts` / `rpc-client.ts` 仅用于浏览器，必须 `client-only`
- `http-server.ts` / `rpc-server.ts` 仅用于服务端，必须 `server-only`
- `sse-client.ts`（如需要）仅创建 SSE 运行时实例；拦截器不含 `console.error` / `console.warn`

### 环境变量

- 使用 `@t3-oss/env-nextjs` 做类型安全的环境变量校验
- 新增环境变量在 `src/config/env.ts` 登记，并在 `.env.example` 补充

</always-applicable>

<task-routing>

目录 owner rule、测试叠加规则与 Skill 触发条件全部继承根 `AGENTS.md`。本文件只补充 client 的 antd 自治、运行时实例与环境变量约束。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
