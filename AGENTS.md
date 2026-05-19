# 项目协作准则

Next.js 16 + React 19，采用 Domain / 应用基础设施 / UI / 路由分层。所有回复使用简体中文。

## Always Load

@.rules/core.rule.md

## Load When Editing

- `domain/**` -> @.rules/domain.rule.md
- `src/components/**` -> @.rules/ui.rule.md
- `src/app/**` -> @.rules/next-app.rule.md
- `**/*.test.*`、`src/__tests__/**` -> @.rules/testing.rule.md

## Architecture

业务能力先进入 `domain/`，运行环境适配放在 `src/lib/` 和 `src/service/`，呈现与交互放在 `src/components/`，路由入口放在 `src/app/`。

组件使用 `export function Name() {}`。类型定义优先使用 `type`。UI 组件通过 `@/components/ui/*` 引入，`ConfigProvider` 可在 `src/app/layout.tsx` 作为应用入口例外。

Domain Controller 采用命名函数导出，模块入口通过 `export * as Controller from './controller'` 暴露公共 API。`hooks.ts` 是运行环境适配层例外，可封装 React Query，但应注入 `httpClient` 并调用 Domain 公共入口。

## Machine Guards

- `pnpm run verify`
- `pnpm test:run`
- `pnpm run lint`

Git hook 已在 `lefthook.yml` 接入 commit message 和 pre-commit 校验。多人协作时只暂存和提交当前任务直接产生的文件。

## Detailed Guidance

- Domain 层：`.claude/skills/domain-layer/`
- 样式系统：`.claude/skills/styling-system/`
- 编码规范：`.claude/skills/coding-standards/`
- 架构说明：`.claude/skills/project-architecture/`
- Next.js App Router：`.claude/skills/nextjs-app-router/`
- Ant Design：`.claude/skills/ant-design/`
- Motion：`.claude/skills/motion/`

规范治理原则见 `docs/decisions/rule-governance.md`。
