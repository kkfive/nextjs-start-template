# Safe Mode（stash 安全备份）

核心原则：**任何分组提交前先创建快照，确保原始状态可恢复。**

## 1. 创建备份

```bash
# 记录回滚点
ROLLBACK_POINT=$(git rev-parse HEAD)

# 保存暂存区快照（包含 staged 文件）
BACKUP_ID="smart-commit-$(date +%Y%m%d-%H%M%S)"
git stash push -m "${BACKUP_ID}-staged" --staged --quiet

# 立即恢复暂存区，stash 保留为备份
git stash apply --quiet
```

## 2. 安全执行流程

```
1. 创建 stash 备份 (BACKUP_ID)
2. 记录 ROLLBACK_POINT = HEAD
3. 分析暂存区 → 生成分组 → 用户确认
4. 对每个分组：
   a. git reset HEAD
   b. git add <group-files>
   c. git commit -m "..."
   d. 成功记入 COMPLETED_COMMITS
5a. 全部成功 → git stash drop（清理备份）
5b. 失败 → 进入 references/recovery.md 的恢复流程
```

## 3. 备份清理

```bash
# 通过 BACKUP_ID 精确清理
git stash list | grep "${BACKUP_ID}" | head -1 | cut -d: -f1 | xargs git stash drop

# 或清理所有 smart-commit 备份（谨慎）
git stash list | grep "smart-commit-" | cut -d: -f1 | xargs -n1 git stash drop
```

## 关键约束

- 备份阶段任何失败 → 中止流程，不开始任何 commit
- 失败发生后**不要**先 `git reset --hard`；先告知用户已完成的 commits
- `git stash drop` 仅在用户明确同意"全部完成"后执行
