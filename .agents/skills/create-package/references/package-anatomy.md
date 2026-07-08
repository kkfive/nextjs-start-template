# 包结构与 exports 详解

## 目录结构

```
packages/<pkg>/
├── src/
│   ├── index.ts          # 公开入口（exports 指向这里）
│   └── ...               # 模块源码
├── tsconfig.json         # extends @kkfive/tsconfig/base.json + references
└── package.json          # name/exports/依赖声明
```

> 按需在 `src/` 下分子目录（如 `contracts` 的 `schemas/` / `types/` / `errors/`；`domain-core` 的 `{module}/`）。

## package.json 关键字段

### name

统一命名空间 `@kkfive/<pkg>`，kebab-case。

### private

本模板不发布到 npm，所有 package 设 `private: true`。

### exports（源码消费）

不预 build，exports 直接指向源码，让消费方编译：

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

如需子路径（如 `@kkfive/domain-core/material`）：

```json
{
  "exports": {
    ".": { "types": "./src/index.ts", "default": "./src/index.ts" },
    "./material": { "types": "./src/material/index.ts", "default": "./src/material/index.ts" }
  }
}
```

### 依赖声明（三类区分）

| 字段 | 用途 | 示例 |
|---|---|---|
| `dependencies` | 运行时必需，会被消费方安装 | `zod`（contracts） |
| `peerDependencies` | 运行时需要但由消费方提供（避免重复实例） | `react`（ui）、`@kkfive/contracts`（http-client） |
| `devDependencies` | 仅开发/构建期 | `@kkfive/tsconfig`、`typescript` |

workspace 内部引用统一用 `workspace:*`：

```json
{
  "dependencies": {
    "@kkfive/contracts": "workspace:*",
    "@kkfive/utils": "workspace:*"
  },
  "peerDependencies": {
    "@kkfive/http-client": "workspace:*"
  },
  "devDependencies": {
    "@kkfive/tsconfig": "workspace:*"
  }
}
```

## 各包依赖约束（依赖规则表摘要）

| 包 | dependencies | peerDependencies | 禁止 |
|---|---|---|---|
| `@kkfive/contracts` | `zod` | —— | 任何运行时框架 |
| `@kkfive/utils` | （零） | —— | 任何框架、`@kkfive/contracts` |
| `@kkfive/http-client` | —— | `@kkfive/contracts` | React/Hono/Next、`@kkfive/domain-core` |
| `@kkfive/domain-core` | `@kkfive/contracts`、`@kkfive/utils` | `@kkfive/http-client` | React/Hono/Next、`@kkfive/ui` |
| `@kkfive/ui` | shadcn/Radix | `react`、`react-dom` | antd、业务代码、`@kkfive/contracts`（除非纯类型） |

## tsconfig.json 关键字段

```json
{
  "extends": "@kkfive/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": [
    { "path": "../contracts" }
  ]
}
```

- `extends @kkfive/tsconfig/base.json`：继承基础预设（含 `composite: true`、`declaration: true`）
- `references`：**必须**声明依赖的 workspace 包，否则 `tsc --build` 不认依赖图
- `composite: true` 强制 `declaration: true`，与源码消费兼容
