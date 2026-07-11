---
name: create-package
description: 新建共享包规范 - 目录结构、package.json exports、tsconfig project references、peer deps、workspace 注册。用于在 packages/ 下新建共享包、配置源码消费、声明依赖边界、注册到 workspace 与根 tsconfig。
user-invocable: true
---

# Create Package

## Scope
- Target: `packages/*` 下新建共享包
- Cover: 目录结构、package.json exports、tsconfig（composite + references）、依赖声明、workspace 注册
- Avoid: 包内分层红线（去 `.agents/rules/packages.rule.md`）；UI 组件实现（去 `/coding-standards`）；新建应用（去 `../create-app/SKILL.md`）

**先加载项目原则**：项目根 `.agents/rules/packages.rule.md` 与 `.agents/rules/monorepo.rule.md`。

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 新建一个共享包（完整流程） | `workflows/new-package.md` |
| 包的目录结构与 exports 怎么写 | `references/package-anatomy.md` |
| 该声明哪些依赖（deps / peer / dev） | `references/package-anatomy.md` |
| 踩坑：幽灵依赖 / exports 解析失败 / project references 漏配 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 抽离判断

新建 package 前，先问：**"换一个新项目，这个包还能直接用吗？"**
- 不能 → 留在 app 内部，等第二个消费方再抽
- 能 → 按本 skill 流程新建

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 新包预 build（产出 dist） | exports 指向 `src/index.ts`，走源码消费 |
| 漏配 tsconfig `references` | 声明依赖的 workspace 包为 references |
| `dependencies` 里写 React/Next | 运行时框架走 `peerDependencies` |
| 未声明的 import | 完整填写全部依赖（pnpm 严格模式 fail fast） |
| 新包不注册 workspace | 更新 `pnpm-workspace.yaml` 与根 `tsconfig.json` references |

## Session Discipline

每次新建共享包时**重新阅读项目根 `.agents/rules/packages.rule.md`** 与本 SKILL.md。

## 相关 Skills

- `.agents/rules/packages.rule.md`：包分类与红线
- `../create-app/SKILL.md`：新建应用（消费 packages）
- `/project-architecture`：monorepo 分层与 packages 定位
