# Workflow: 配置 CI affected filter

**触发条件**：CI 每次 PR 全量跑太慢，想让 CI 只构建/测试受影响的包。

**目标**：PR 跑增量（受影响包 + 下游），主干推送跑全量。

## Step 1: 原理

`turbo run build --filter='...[origin/master]'` 表示"受 `origin/master..HEAD` 变化影响的包**及其下游 dependents**"。需要完整 git 历史（`actions/checkout` 加 `fetch-depth: 0`）。

filter 形态：
- `...[origin/master]`：受影响包 + 下游（最常用）
- `[origin/master]`：仅直接改动的包
- `pkg...`：pkg 及其上游依赖

## Step 2: PR 增量 / push 全量

PR 事件用 affected（base = `github.base_ref`）；push 到主干强制全量（多 commit 不漏检）。用 step 计算 filter：

```yaml
- name: Resolve turbo filter（PR 跑受影响包 / push 全量）
  id: turbo
  env:
    BASE_REF: ${{ github.base_ref }}
    EVENT: ${{ github.event_name }}
  run: |
    if [ "$EVENT" = "pull_request" ] && [ -n "$BASE_REF" ]; then
      git fetch origin "$BASE_REF" 2>/dev/null || true
      echo "filter=...[origin/$BASE_REF]" >> "$GITHUB_OUTPUT"
    else
      echo "filter=" >> "$GITHUB_OUTPUT"
    fi
```

命令侧空 filter = 全量：

```yaml
run: |
  if [ -n "${{ steps.turbo.outputs.filter }}" ]; then
    pnpm exec turbo run build --filter="${{ steps.turbo.outputs.filter }}"
  else
    pnpm build
  fi
```

## Step 3: 全局检查保持全量

**不要**给这些加 affected：

| 检查 | 为什么全量 |
|---|---|
| lint | 规范门禁需全局一致 |
| typecheck | 类型安全跨包 |
| verify:conventions | 跨包规范 / enum 一致性 |

只给**耗时任务**（build / test）加 affected。本项目实际结构见 `.github/workflows/ci.yml`（lint/typecheck 全量，test/build affected）。

## Step 4: 验证 filter 语法

```bash
pnpm exec turbo run build --filter='...[origin/master]' --dry-run   # 看会跑哪些包
```

## 注意

- 默认分支是 **master**，filter 用 `origin/master`
- PR 首次或 fork 场景，`git fetch origin <base_ref>` 确保 ref 存在
