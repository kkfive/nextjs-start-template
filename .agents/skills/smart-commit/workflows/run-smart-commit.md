# 端到端执行 smart-commit

完整流程：备份 → 分析 → 分组 → 确认 → 提交 → 清理。

## 步骤

1. **创建安全备份**（见 `safe-mode.md`）
   - `ROLLBACK_POINT=$(git rev-parse HEAD)`
   - `git stash push -m "smart-commit-$(date +%Y%m%d-%H%M%S)-staged" --staged --quiet`
   - `git stash apply --quiet`（恢复暂存区，保留 stash 为备份）

2. **读取 commitlint 配置**（见 `references/commitlint-config.md`）
   - 拿 `type-enum`、`subject-max-length`、`header-max-length`

3. **读取暂存区**
   ```bash
   git diff --cached --name-status
   git diff --cached --stat
   ```

4. **按 `rules/grouping-strategy.md` 分组**
   - 配置 / 文档 / Skills / 业务功能 / 删除 分别归位

5. **为每组推断 type**（见 `references/type-inference.md`）

6. **生成 Commit Plan 给用户确认**
   - 展示备份 ID、ROLLBACK_POINT、每个 commit 的 type/subject/files

7. **按组提交**
   ```bash
   for group in groups:
     git reset HEAD                  # 清空暂存区
     git add <group_files>           # 仅添加该组
     git commit -m "<type>: <subject>"
     record commit_hash
   ```

8. **结束处理**
   - 全部成功 → `git stash drop` 清理备份
   - 部分失败 → 走 `references/recovery.md` 给用户选项

## Commit Plan 模板

```markdown
## Commit Plan

**安全备份**: smart-commit-20260520-143052-staged (stash@{0})
**回滚点**: abc1234

### Commit 1/3: feat: 新增认证模块
- domain/auth/index.ts
- domain/auth/schema.ts
- domain/auth/type.ts

### Commit 2/3: feat: 新增认证页面
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx

### Commit 3/3: chore: 删除示例代码
- domain/example/** (15 files, deleted)
```

## 完成模板

```
✓ Commit 1/3 abc1234 feat: 新增认证模块
✓ Commit 2/3 def5678 feat: 新增认证页面
✓ Commit 3/3 ghi9012 chore: 删除示例代码

总计：3 个 commit / 22 文件
备份已清理：smart-commit-20260520-143052-staged
```

## 检查

- [ ] stash 备份已创建并记录 ID
- [ ] ROLLBACK_POINT 已记录
- [ ] commitlint 配置已读取，推断使用的 type 全在 `type-enum` 内
- [ ] 用户已确认 Commit Plan
- [ ] 每个 commit message 通过 commitlint 验证
- [ ] 成功后清理 stash；失败按 `recovery.md` 处理
