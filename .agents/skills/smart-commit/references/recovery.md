# 失败恢复

执行过程中任何一个 commit 失败时，给用户 4 个选项。

## 失败展示

```
✓ Commit 1/3 abc1234 feat: 新增认证模块
✓ Commit 2/3 def5678 feat: 新增认证页面
✗ Commit 3/3 chore: 删除示例代码 — 失败

错误：pre-commit hook 失败 / commitlint 校验失败 / ...

已完成 2/3 commits:
  abc1234 feat: 新增认证模块
  def5678 feat: 新增认证页面

未提交：domain/example/** (15 files)

恢复选项：
  [1] 继续      手动修复后继续剩余分组
  [2] 回滚全部   git reset --soft ${ROLLBACK_POINT}（撤销新 commits，保留变更）
  [3] 恢复原始   git reset --hard ${ROLLBACK_POINT} && git stash pop（完全恢复）
  [4] 保留已完成 不动，接受当前状态
```

## 各选项命令

```bash
# [2] 回滚全部新 commit，文件变更保留在工作区
git reset --soft "${ROLLBACK_POINT}"

# [3] 完全恢复到执行前
git reset --hard "${ROLLBACK_POINT}"
git stash pop  # 从 BACKUP_ID 对应的 stash 恢复暂存区

# [4] 保留已完成，仅清理已不需要的备份（用户确认才执行）
git stash drop "${STASH_REF}"
```

## 关键安全约束

- **不要**在用户未选项之前自动 `reset --hard`
- 已完成 commit 的 hash 必须打印给用户
- stash 不要被自动 drop —— 仅在用户选 [4] 且明确同意才清理
- `pop` 失败（冲突）时停止并报告，让用户处理
