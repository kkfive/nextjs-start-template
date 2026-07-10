# Workflow: 优化 Turborepo 构建缓存

**触发条件**：构建慢、cache 命中率低、改了配置/环境变量但 build 没重跑（stale）。

**目标**：让 turbo cache 做到"输入真变了才失效、没变就命中"。

## Step 1: 确认 cache 三要素到位

每个可缓存 task 应配置：

| 要素 | 作用 | 漏配后果 |
|---|---|---|
| `inputs` | 哪些文件计入 hash | 无关文件（md/test）改动不必要地失效 cache |
| `outputs` | 缓存什么产物 | 命中后无法恢复产物 |
| `env` / `globalEnv` | 哪些环境变量计入 hash | env 变了 build 用旧 cache → stale |

## Step 2: 用 `$TURBO_DEFAULT$` 起步

`inputs: ["$TURBO_DEFAULT$"]` 已含包源码 + 配置 + 依赖声明。在其上用 `!` 排除无关项，**不要从零列举**（易漏）。

## Step 3: 声明影响构建的 env

build task 必须声明影响产物的环境变量（前端公开变量、构建开关等）。顶层 `globalEnv` 声明影响所有 task 的（如 `NODE_ENV`/`CI`），`globalDependencies` 声明变化即全失效的文件（如 `**/.env.*local`）。

> 本项目 `turbo.json` 的 build 已声明实际的公开变量 + 构建开关，作为模板。

## Step 4: 排查 stale cache

```bash
pnpm exec turbo run build --dry=json   # 确认目标 env / 文件在 hash inputs 里
pnpm exec turbo run build --force      # 强制忽略 cache 重跑验证
```

若 env 不在 hash inputs 里 → 补 task 的 `env` 字段。

## Step 5: 验证命中率

```bash
pnpm build    # 第一次：构建并填 cache
pnpm build    # 第二次：应全部命中（FULL TURBO）
```

改一个 `.md` 文件后再跑 build——不应触发重构建（因 inputs 排除了 md）。
