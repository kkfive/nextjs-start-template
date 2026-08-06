# 项目协作入口

回复使用简体中文。本文件只提供任务路由；实现事实以代码、类型、测试、manifest 与配置为准。

编辑 `apps/**` 或 `packages/ui/**` 时读取最近的 scoped `AGENTS.md`；测试文件叠加 `testing.rule.md`。

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

- 新建定义前检索已有实现；行为变化路由到 `evidence-first-development`。
- `.workflow/`、历史状态和 AI 自述不能作为源码或验收证据。
