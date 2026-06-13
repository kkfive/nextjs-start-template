---
name: smart-commit
description: 智能分析暂存区文件，按功能归类拆成多个最小化 commit，符合 commitlint 规范、保留 stash 安全备份、失败时提供回滚选项。用于一次性提交多功能变更、清理混杂暂存、批量重构后的分组归档。
user-invocable: true
---

# Smart Commit

## Scope
- Target: Git 暂存区文件的智能分组提交
- Cover: stash 安全备份、commitlint 适配、按功能/类型分组、失败回滚
- Avoid: 操作未暂存的工作区；包含署名的 commit；跨功能合并

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 端到端执行：从分析到完成 | `workflows/run-smart-commit.md` |
| 仅了解 stash 备份与执行安全机制 | `workflows/safe-mode.md` |
| commit message 规则（type / subject / 禁署名） | `rules/commit-message.md` |
| 文件如何分组、什么独立 commit | `rules/grouping-strategy.md` |
| commit type 怎么推断 | `references/type-inference.md` |
| 读取 commitlint 配置 | `references/commitlint-config.md` |
| 失败后如何恢复 | `references/recovery.md` |
| 踩坑速查 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 调用方式

```bash
# 1. 将要提交的文件加入暂存区
git add <files>

# 2. 调用 skill
/smart-commit

# 3. 审阅 commit plan，确认后自动执行
```

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 所有文件一次 commit | 按功能分组拆 |
| commit message 含 "by Claude" 等署名 | 仅描述变更本身 |
| 混合配置与功能代码 | 配置独立 commit |
| Subject > 50 字符 | ≤ 50；中文，无句号 |
| 跳过 stash 备份直接操作暂存区 | 必先 stash + 记录 ROLLBACK_POINT |
| 失败后无法恢复原状 | 提供 4 种恢复选项（见 recovery.md） |

## Session Discipline

每次调用本 skill 时**重新阅读**：规则与分组策略可能随 commitlint 配置更新。

## 相关 Skills

- `/coding-standards`：编码规范（代码质量检查）
- `/project-architecture`：项目架构（理解模块划分）
