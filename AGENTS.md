# 项目协作入口

pnpm + Turborepo monorepo：`apps/` 是应用，`packages/` 是共享能力，`internal/` 是工具链。回复使用简体中文。

当前代码与真实命令是事实源；本文件只路由，不复制规则正文。编辑 `apps/**` 或 `packages/ui/**` 时，还要读取目标路径最近的 scoped `AGENTS.md`（如存在）。测试文件在 owner rule 之外叠加 `testing.rule.md`。

## 路径路由

| 路径 | 读取 |
|---|---|
| `apps/*/src/features/**` | `.agents/rules/feature.rule.md` |
| `apps/*/src/service/**` | `.agents/rules/service.rule.md` |
| `apps/*/src/app/**` | `.agents/rules/next-app.rule.md` |
| `apps/*/src/components/**`、`apps/*/src/styles/**` | `.agents/rules/ui.rule.md` |
| `apps/*/src/lib/**`、`apps/*/src/config/**` | `.agents/rules/core.rule.md` |
| `apps/api/**` | `.agents/rules/hono.rule.md` |
| `packages/**` | `.agents/rules/packages.rule.md` |
| `internal/**`、`scripts/repo-tooling/**`、`.github/workflows/**`、`turbo.json`、`pnpm-workspace.yaml` | `.agents/rules/monorepo.rule.md` |
| `**/*.test.*`、`**/*.spec.*` | 加读 `.agents/rules/testing.rule.md` |

## 意图路由

- TypeScript、React、import 或测试源码写法：`coding-standards`。
- App Router runtime、缓存、Metadata、Route Handler 或 Server Action：`nextjs-app-router`。
- 明确的视觉、主题、CSS Variables、Tailwind/SCSS 方案：`styling-system`。
- 改变目录归属、模块拆分、依赖边界或新建 app/package：`project-architecture`。
- Turbo、CI、workspace 或机器治理：`monorepo-engineering`。
- 行为、契约或工程行为变化：`evidence-first-development`。
- 审计提示词、rules、skills、触发或上下文成本：`ai-friendliness-audit`。

## 工作与门禁

- 新建组件、类型、service 或 util 前检索并复用已有实现。
- 不把 `.workflow/`、历史状态或 AI 自述当作源码事实或验收证据。
- 行为变化先按 `evidence-first-development` 取得有效 RED 或等价失败证据；纯文档可免新增 RED。
- 非平凡修改运行聚焦证据、直接消费者回归、`pnpm verify` 与 `pnpm test:run`；app/构建配置变化再运行相关 build。
- Node 版本以 `mise.toml` 为准；只修改任务相关文件，不回滚其他工作树改动。
