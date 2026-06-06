# 项目协作准则

Next.js 16 + React 19，采用 Domain / 应用基础设施 / UI / 路由分层。所有回复使用简体中文。

本文件是 **Claude Code（通过 `CLAUDE.md`）与 Codex CLI** 的共同入口。Codex 用户读本文件即可获得完整规则索引；根目录不再保留 `CODEX.md`。

## Always Load

@.agents/rules/core.rule.md

## Load When Editing

- `domain/**` → @.agents/rules/domain.rule.md
- `src/components/**` → @.agents/rules/ui.rule.md
- `src/app/**` → @.agents/rules/next-app.rule.md
- `**/*.test.*`、`src/__tests__/**` → @.agents/rules/testing.rule.md

规则文件简短只表达稳定原则；具体流程、示例、踩坑见下方 Skill Index。

## Skill Index

所有项目 skill 位于 `.agents/skills/<name>/`，这是跨 agent 的唯一规范目录。各 agent 通过本索引按需打开对应 `SKILL.md`。

| Skill | 入口 | 何时使用 |
|---|---|---|
| project-architecture | `.agents/skills/project-architecture/SKILL.md` | 决定新代码放哪一层、检查跨层 import |
| coding-standards | `.agents/skills/coding-standards/SKILL.md` | 写组件代码、解决 import 报错、类型/错误/图标/测试规范 |
| domain-layer | `.agents/skills/domain-layer/SKILL.md` | 新建 Domain 模块、写 Service/Controller/Hooks |
| nextjs-app-router | `.agents/skills/nextjs-app-router/SKILL.md` | `src/app/` 下新建页面/API/Server Action、缓存与 Metadata |
| ant-design | `.agents/skills/ant-design/SKILL.md` | antd 组件 / ConfigProvider / SSR / 高级 Form/Table |
| styling-system | `.agents/skills/styling-system/SKILL.md` | 调样式（5 级优先级）、主题切换、暗色 |
| motion | `.agents/skills/motion/SKILL.md` | Motion 动画（手势、滚动、布局、退出） |
| searches-iconify | `.agents/skills/searches-iconify/SKILL.md` | Iconify 图标搜索 |
| smart-commit | `.agents/skills/smart-commit/SKILL.md` | 暂存区分组拆 commit |
| _template | `.agents/skills/_template/` | 新建 skill 的起点 |

每个 skill 内部结构：`SKILL.md`（入口 ≤ 90 行）+ `routing.yaml`（任务路由）+ `rules/` + `workflows/` + `references/`（含 `gotchas.md`）。

## Machine Guards

- `pnpm run verify`
- `pnpm test:run`
- `pnpm run lint`

Git hook 在 `lefthook.yml` 接入 commit message 与 pre-commit 校验。多人协作时只暂存和提交当前任务直接产生的文件。

## 参考

- 规范治理原则：`docs/decisions/rule-governance.md`
- Skill 模板与 16 条原则：`.agents/skills/_template/`
