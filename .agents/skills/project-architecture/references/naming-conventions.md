# 命名规范

文件名 kebab-case 由 eslint `unicorn/filename-case` 强制，此处不再列文件名规则。

## 代码标识符

| 类型 | 规则 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `HitokotoCard` |
| 函数 / 变量 | camelCase | `getData`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE 或 camelCase | `API_BASE_URL` |
| 类型 | PascalCase | `UserProfile` |
| Zustand Store | `use{Name}Store` | `useMouseStore` |
| React Hook | `use{Name}`（文件 `use-{name}.ts`） | `useMobile` |
| 目录 / 模块私有前缀 | `_` 前缀表内部私有 | `_shared/` |

## 组件 Props

命名为 `{ComponentName}Props`；简单 Props 与组件同文件，复杂 Props 可独立 `props.ts`。

## 契约模块导出

共享包契约模块的标准形态（zod-first、`export type`、`z.infer` 单一真源）见 `/coding-standards` 的 `references/types.md`，此处不重复。
