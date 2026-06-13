# 层级依赖规则

## 禁止的导入

```
❌ domain/ → @/components/*
❌ domain/ → @/hooks/*
❌ domain/ → @/store/*
❌ domain/ → @/app/*
```

## 允许的导入

```
✅ domain/ → @/lib/*
✅ src/components/domain/ → @domain/*
✅ src/components/domain/ → @/components/ui/*
✅ src/app/ → @/components/ui/*
```

## 核心原则

- **Domain 核心逻辑框架无关**：禁止导入 React 组件、Next.js、UI、应用 hooks 和 stores；`domain/**/hooks.ts` 是 React Query 适配层例外
- **单向依赖**：应用层可以导入 Domain 层，反之不行
- **抽象层例外**：Domain 层可以导入 `@/lib/*` 抽象层（HTTP、工具函数）
