# Next.js Start Template

基于 pnpm workspace + Turborepo 的 monorepo 项目模板，采用 Feature-first 架构，支持多应用（客户端 / 管理后台 / API 服务）共享通用能力与 UI。

## 特性

- **Monorepo** — pnpm workspace + Turborepo，`apps/` 独立应用 + `packages/` 共享包 + `internal/` 工具链
- **Next.js + React** — App Router 与 Server Components
- **Feature-first** — 业务能力聚合在 app 的 `src/features/<feature>/`；路由只组合，运行时实例只在 `src/service/`
- **TypeScript** — project references 跨包增量类型检查
- **Tailwind CSS v4** — 原子化 CSS，主题 token 共享
- **TanStack Query + Zustand** — 服务端与客户端状态管理
- **Vitest + MSW** — 单元测试与 API Mock
- **AI 辅助开发规范** — `AGENTS.md` 提供薄路由，`.agents/` 仅在任务命中时加载

## 快速开始

```bash
# 克隆
git clone https://github.com/kkfive/nextjs-start-template.git my-project
cd my-project

# 安装依赖
pnpm install

# 启动所有 app 开发服务器
pnpm dev
```

各 app 端口：client `5373`、admin `5374`、api `8787`。单 app 启动用 `pnpm --filter client dev`。

## 项目结构

```
├── apps/                          # 独立应用
│   ├── client/                    # Next.js 客户端
│   ├── admin/                     # Next.js 管理后台（示例）
│   └── api/                       # Hono API 服务（示例）
├── packages/                      # 共享包
│   ├── contracts/                 # API 契约（zod schema + 类型）
│   ├── http-client/               # HTTP 抽象（HttpService）
│   ├── rpc/                       # 泛型 Hono RPC 工厂与 envelope 解包
│   ├── utils/                     # 纯工具函数
│   └── ui/                        # 基础 UI 组件（shadcn）
├── internal/                      # 工具链配置预设
│   ├── nextjs-config/             # Next.js 预设
│   ├── tailwind-config/           # Tailwind/PostCSS 预设
│   └── tsconfig/                  # TypeScript 预设
├── scripts/repo-tooling/          # 仓库级架构与 workspace guards
├── docs/                          # 当前使用文档
└── .agents/                       # AI 辅助开发规范
```

每个 Next.js app 的业务代码归入 `src/features/`，`src/app/` 只负责组合路由，`src/service/` 仅保存 HTTP/RPC/SSE 运行时实例。详细架构与编码规范见 [AGENTS.md](AGENTS.md) 与 `.agents/`。

## 常用命令

| 命令             | 说明                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `pnpm dev`       | 启动所有 app 开发服务器                                                  |
| `pnpm build`     | 构建所有 app                                                             |
| `pnpm lint`      | ESLint 检查                                                              |
| `pnpm typecheck` | TypeScript 类型检查                                                      |
| `pnpm test:run`  | 运行测试                                                                 |
| `pnpm verify`    | lint、typecheck、依赖一致性、架构策略及 fixture 校验（不替代测试或构建） |

> 单 app 操作：`pnpm --filter client dev`、`pnpm --filter client build` 等。

## 文档

- [项目协作准则（AGENTS.md）](AGENTS.md) — AI 辅助开发的全局规范入口
- [FAQ](docs/faq.md) — 常见问题

## License

[MIT](./LICENSE)
