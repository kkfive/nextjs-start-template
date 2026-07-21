# 项目协作准则

本仓库是 pnpm workspace + Turborepo monorepo：`apps/` 是独立应用，`packages/` 是共享能力，`internal/` 是工具链配置。Next.js app 使用 Feature-first：业务代码放 `src/features/`，`src/service/` 只创建运行时实例，`src/app/` 只组合路由。所有回复使用简体中文。

## 权威与加载

- 用户当前要求优先于仓库内历史规范。规则与当前代码或真实命令冲突时，先用代码和端到端结果裁决，再同步修正规则。
- 本文件只负责路由，不 eager include `.agents/`。仅在任务命中下列路径或主题时读取对应 rule/skill。
- `CLAUDE.md`、Codex 和其他工具均以本文件为项目入口；不要复制第二份规则正文。

## 按路径加载

路径规则先确定 owner rule；测试规则只作为跨路径叠加层，不替代 owner rule。

| 路径 | 必须加载 |
|---|---|
| `apps/*/src/features/**` | `.agents/rules/feature.rule.md` |
| `apps/*/src/features/**/*.test.*` | `.agents/rules/feature.rule.md` + `.agents/rules/testing.rule.md` |
| `apps/*/src/service/**` | `.agents/rules/service.rule.md` |
| `apps/*/src/service/**/*.test.*` | `.agents/rules/service.rule.md` + `.agents/rules/testing.rule.md` |
| `apps/*/src/app/**` | `.agents/rules/next-app.rule.md` |
| `apps/*/src/components/**` | `.agents/rules/ui.rule.md` |
| `apps/*/src/lib/**`、`apps/*/src/config/**` | `.agents/rules/core.rule.md` |
| `apps/*/src/styles/**` | `.agents/rules/ui.rule.md` + `styling-system` skill |
| `apps/api/**` | `.agents/rules/hono.rule.md` |
| `packages/**` | `.agents/rules/packages.rule.md` |
| `packages/**/*.test.*` | `.agents/rules/packages.rule.md` + `.agents/rules/testing.rule.md` |
| `packages/ui/**` | `.agents/rules/packages.rule.md` + `.agents/rules/ui.rule.md` |
| `internal/**`、`scripts/repo-tooling/**`、`.github/workflows/**`、`turbo.json`、`pnpm-workspace.yaml` | `.agents/rules/monorepo.rule.md` + `monorepo-engineering` skill |

任何其他 `*.test.*` 或 `*.spec.*` 文件，都在其 owner rule 之外叠加 `.agents/rules/testing.rule.md`。

## 按意图加载 Skill

- TypeScript、React、import，或实际 `*.test.*` / `*.spec.*` 测试源码的文件级写法：`coding-standards`；CI 中的 `test` / `build` job 名称不触发。
- `apps/*/src/app/**` 下的 App Router 页面、布局、Route Handler、Server Action、缓存或 Metadata：`nextjs-app-router`。
- 只有用户明确要求视觉/布局设计、主题、CSS Variables、Tailwind/SCSS class 方案或样式冲突时才触发 `styling-system`；页面实现中为了结构或复用控件而写普通 `className`、Tailwind utility、表单布局不触发，普通 UI import 也不触发。
- 仅当用户明确要求改变目录归属、模块拆分、跨层/跨包依赖边界，或创建新 app/package 时使用 `project-architecture`。按现有 Feature-first 模板新增普通 page、feature 或 public entry 不触发；这类页面实现使用 owner rule、`nextjs-app-router` 与 `coding-standards`。
- 明确修改 Turbo、CI、workspace 或 architecture-policy 工程化：`monorepo-engineering`；普通页面与普通 package 代码不触发。

## 工作方式

- 新建组件、类型、service 或 util 前先检索已有实现；已有则复用或改造。
- `.workflow/` 是 ignored 的本地任务状态，不是源码、规范或脚本输入；Git 历史承担演变记录。
- tracked 文档只描述当前使用方式，不记录迁移波次、临时验收状态或已删除方案。
- 只修改当前任务文件；不要回滚工作树中的其他用户改动。

## 完成门禁

- 非平凡修改运行 `pnpm verify` 与 `pnpm test:run`。
- 修改 app 或构建配置时，再运行相关 app build。
- 项目要求 Node 24；使用 `mise.toml` 指定的版本。
