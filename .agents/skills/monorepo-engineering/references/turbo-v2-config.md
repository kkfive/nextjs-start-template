# turbo.json v2 配置范例（本项目）

完整范例见仓库根 `turbo.json`。关键字段说明。

## 顶层全局项

```jsonc
{
  "globalDependencies": ["**/.env.*local"],  // 这些文件变化 → 所有 task cache 失效
  "globalEnv": ["NODE_ENV", "CI"]             // 这些 env 变化 → 影响所有 task 的 hash
}
```

## build task（最需要精细化）

```jsonc
"build": {
  "dependsOn": ["^build"],                          // 先构建上游依赖包
  "outputs": [".next/**", "!.next/cache/**", "dist/**"],  // 缓存的产物路径
  "inputs": [                                       // 计入 hash 的输入
    "$TURBO_DEFAULT$",
    "!**/*.md", "!**/*.test.*", "!**/*.spec.*",
    "!**/*.stories.*", "!**/__tests__/**"
  ],
  "env": [                                          // 影响构建的环境变量（必须声明，否则 stale）
    "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_DEBUG", "NEXT_PUBLIC_GA_ID",
    "SKIP_ENV_VALIDATION"
  ]
}
```

## dev task（长驻，不缓存）

```jsonc
"dev": { "cache": false, "persistent": true }
```

> `persistent: true` 的 task 不能有 dependents。

## 纯检查 task（lint / typecheck / test）

```jsonc
"lint":      { "dependsOn": [],        "inputs": ["$TURBO_DEFAULT$"] },
"typecheck": { "dependsOn": ["^typecheck"], "inputs": ["$TURBO_DEFAULT$"] },
"test:run":  { "dependsOn": [],        "inputs": ["$TURBO_DEFAULT$"] }
```

## 排查 cache 行为

```bash
pnpm exec turbo run build --dry=json   # 查看每个 task 的 hash inputs / outputs
pnpm exec turbo run build --force      # 强制忽略 cache 重跑（排查 stale）
pnpm exec turbo run build --graph      # 生成任务依赖图
```

## dependsOn 三种语义

- `^build`：上游依赖包的 build 先跑（拓扑序）
- `build`：同包内 build 先跑
- 无 dependsOn：独立，可与其它 task 并行
