# 项目协作准则

本仓库是 pnpm workspace + Turborepo monorepo：`apps/` 是独立应用，`packages/` 是共享能力，`internal/` 是工具链配置。Next.js app 使用 Feature-first：业务代码放 `src/features/`，`src/service/` 只创建运行时实例，`src/app/` 只组合路由。所有回复使用简体中文。

## 权威与加载

- 用户当前要求优先于仓库内历史规范。规则与当前代码或真实命令冲突时，先用代码和端到端结果裁决，再同步修正规则。
- 本文件只负责路由，不 eager include `.agents/`。仅在任务命中下列路径或主题时读取对应 rule/skill。
- `CLAUDE.md`、Codex 和其他工具均以本文件为项目入口；不要复制第二份规则正文。

## 按路径加载

- `apps/*/src/features/**`：`.agents/rules/feature.rule.md`
- `apps/*/src/service/**`：`.agents/rules/service.rule.md`
- `apps/*/src/app/**`：`.agents/rules/next-app.rule.md`；测试文件再读 `testing.rule.md`
- `apps/api/**`：`.agents/rules/hono.rule.md`
- `packages/**`：`.agents/rules/packages.rule.md`；UI 文件再读 `ui.rule.md`
- monorepo、CI、Turbo、依赖治理：`.agents/rules/monorepo.rule.md` 与 `monorepo-engineering` skill
- TypeScript/React/import/test 写法：`coding-standards` skill
- Next.js App Router：`nextjs-app-router` skill
- 样式、Ant Design、Tailwind：`styling-system` skill
- 目录和依赖边界设计：`project-architecture` skill

## 工作方式

- 新建组件、类型、service 或 util 前先检索已有实现；已有则复用或改造。
- `.workflow/` 是 ignored 的本地任务状态，不是源码、规范或脚本输入；Git 历史承担演变记录。
- tracked 文档只描述当前使用方式，不记录迁移波次、临时验收状态或已删除方案。
- 只修改当前任务文件；不要回滚工作树中的其他用户改动。

## 完成门禁

- 非平凡修改运行 `pnpm verify` 与 `pnpm test:run`。
- 修改 app 或构建配置时，再运行相关 app build。
- 项目要求 Node 24；使用 `mise.toml` 指定的版本。
