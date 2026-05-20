# Gotchas

## commitlint

- **推断的 type 不在 type-enum 里**：必须退到 enum 内的安全值（如 `chore`），否则被 hook 拒
- **subject 含句号**：`subject-full-stop` 规则会拒
- **subject 过长**：按 `subject-max-length` 截断或重写更短
- **整 header 过长**：含 scope 时容易超 `header-max-length`

## stash

- `git stash apply --quiet` 在有冲突时静默失败 —— 必须检查 `$?`
- 多个 smart-commit 备份同时存在时按 `BACKUP_ID` 精准清理，不要批量 `stash clear`
- `--staged` 是 git 2.35+ 才支持的；旧版需用 `git stash push -- $(git diff --cached --name-only)`

## 暂存区操作

- `git reset HEAD` 会清空 index 但保留工作区改动；这是设计意图
- `git add` 后被 pre-commit 钩子改写的文件会自动重新添加（lint-staged）；预期内
- 提交期间禁止用户手动 `git add`，否则分组失真 —— 流程开始前提示

## hook 失败

- `pre-commit` 失败通常是 lint / typecheck → 让用户修复后选 [1] 继续，不要 `--no-verify`
- `commit-msg` 失败通常是 commitlint → 把生成的 message 回显给用户便于修改

## 边界场景

- 暂存区为空 → 直接告知"无可提交"，不进入流程
- 仅一个文件 → 跳过分组，直接单 commit
- 全是 untracked → 提示用户先 `git add`
- 二进制大文件混入 → 单列一组并提示
