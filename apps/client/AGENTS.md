# apps/client 协作准则（主应用 Next.js）

`apps/client` 是主应用（Next.js App Router），面向终端用户的客户端。它同时承担 BFF 职责（`src/app/api/` 做聚合/转发，非完整后端）。

继承根 `AGENTS.md` 全部规则，补充本 app 专属约束。与根级冲突时以本文件为准（但不违反根级硬性约束）。

<always-applicable>

## 关键约束

### Domain 适配层（client 特有：含 React Query hooks）

- `domain/` 是运行环境适配层：re-export `@kkfive/domain-core` 纯逻辑 + 注入客户端 HttpService + 封装 React Query hooks
- HTTP 实例由调用方注入（hooks 从 `@/service/index.client` 导入 httpClient），Domain 不自建实例
- 共享包核心逻辑框架无关；hooks 只调用 Domain 公共入口并注入 HTTP 实例

### antd 自治

- antd 及 `@ant-design/*` 在 client 内自行安装与配置，**不进 `@kkfive/ui`**
- ConfigProvider / theme token 在 `src/components/providers.tsx` 自治，避免与 `@kkfive/ui` 体系冲突
- 业务封装基于 antd 的组件留在 `src/components/`，不进共享包

### HTTP 服务分层（src/service/）

- `index.base.ts` — 公共实例配置
- `index.client.ts` — 客户端 HttpService（浏览器环境，含 BFF 前缀）
- `index.server.ts` — 服务端 HttpService（SSR 场景）
- `index.sse.ts` — SSE 流式请求
- 拦截器不含 `console.error` / `console.warn`（交由业务层处理）

### 环境变量

- 使用 `@t3-oss/env-nextjs` 做类型安全的环境变量校验
- 新增环境变量在 `src/config/env.ts` 登记，并在 `.env.example` 补充

</always-applicable>

<task-routing>

## 目录结构

```
apps/client/
├── domain/              # 适配层（re-export domain-core + hooks）
├── src/
│   ├── app/             # 路由 / 页面 / BFF api 路由
│   ├── components/      # 业务组件 + providers + ui 入口
│   ├── config/          # 环境变量、站点配置
│   ├── hooks/           # app 级 hooks
│   ├── lib/             # app 级工具函数
│   ├── service/         # HttpService 实例（client/server/sse）
│   ├── store/           # 客户端状态（zustand）
│   └── styles/          # 全局样式
├── public/              # 静态资源
└── typings/             # 全局类型声明
```

Skill 的 meta 由工具自动注入，按 description 匹配按需打开。client 额外有包级专属 skill `ant-design`（`.agents/skills/ant-design/`）。

## 参考

- 根级规范：`../../AGENTS.md`
- 重构决策：`docs/decisions/monorepo-restructuring.md`

</task-routing>
