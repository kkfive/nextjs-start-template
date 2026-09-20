# CI affected filter（约束）

本项目的 affected 配置**已实现于 `.github/workflows/ci.yml`**，该文件是事实源；本文只保留改动它时必须遵守的约束。

## 约束

- **耗时任务**（build / test）可走 affected；**全局一致性检查必须全量**：lint、typecheck、verify:architecture —— 加 affected 会破坏跨包一致性保证
- PR 事件用 affected，push 到主干强制全量（多 commit 不漏检）
- 默认分支是 **master**，filter 用 `origin/master`；需要完整 git 历史（`fetch-depth: 0`）

## filter 语法速查

| 写法 | 含义 |
|---|---|
| `...[origin/master]` | 受影响包 + 下游 dependents（最常用） |
| `[origin/master]` | 仅直接改动的包 |
| `pkg...` | pkg 及其上游依赖 |

验证：`pnpm exec turbo run build --filter='...[origin/master]' --dry-run` 看会跑哪些包。
