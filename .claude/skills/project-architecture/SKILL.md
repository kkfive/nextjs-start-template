---
name: project-architecture
description: 项目架构和组织规范 - 三层架构（Domain/应用/UI）、依赖规则、目录约定、命名规范。用于创建新模块、组织项目结构、文件命名、理解架构分层。
user-invocable: true
---

# Project Architecture

## S - Scope
- Target: Next.js 16 + React 19 三层架构项目
- Cover: 层级分离、依赖规则、目录约定、命名规范
- Avoid: 违反层级依赖、错误的文件命名、不符合约定的目录结构

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
架构概览 | 三层架构、层级分离、依赖规则 | `references/architecture-overview.md`
目录约定 | 文件和目录组织规范 | `references/directory-structure.md`
命名规范 | 文件、目录、代码标识符命名 | `references/naming-conventions.md`

## P - Process
1. **识别层级**：确定代码所属层级（domain/、src/lib/、src/components/、src/app/）
2. **检查依赖规则**：
   - `domain/` 只能导入 `@/lib/*` 和外部库
   - `src/components/domain/` 可导入 `@domain/*`、`@/components/ui/*`、`@/components/common/*`
   - `src/components/common/` 不依赖特定 domain
   - `src/components/ui/` 仅封装或透传第三方 UI 库
   - `src/app/` 通过 `@/components/ui/*` 使用 UI 组件
3. **选择目录结构**：
   - Domain 模块：`domain/{module}/` (controller/service/type.d.ts)
   - UI 组件：`src/components/ui/{component}/index.tsx`
   - 领域 UI：`src/components/domain/{module}/{component}.tsx`
4. **应用命名规范**：
   - 目录：kebab-case
   - React 组件文件：kebab-case
   - React 组件：PascalCase
   - 函数/变量：camelCase

## O - Output
- 推荐架构层级及依赖关系
- 提供目录结构示例
- 指出违反架构规范的代码
- 包含验证清单（依赖检查、命名规范、目录约定）

## 三层架构

```
domain/              → 业务逻辑层 (框架无关，禁止 React)
src/lib/             → 基础设施层 (HTTP、工具函数)
src/components/ui/   → 基础 UI (透传或封装 antd)
src/components/common/ → 通用功能组件 (可复用的功能性组件)
src/components/domain/ → 领域 UI (结合业务逻辑与 UI)
src/app/             → 页面路由层 (仅 page/layout/route)
```

## 依赖规则

| 层级 | 可以导入 | 禁止导入 |
|------|----------|----------|
| `domain/` | `@/lib/*`、外部库 | `@/components/*`、`@/app/*`、`@/hooks/*`、`@/store/*` |
| `src/components/domain/` | `@domain/*`、`@/components/ui/*`、`@/components/common/*`、`@/lib/*` | 第三方 UI 库（如 antd） |
| `src/components/common/` | `@/components/ui/*`、`@/lib/*`、外部库 | `@domain/*`、业务逻辑 |
| `src/components/ui/` | 第三方 UI 库（如 antd）、外部库 | `@domain/*`、`@/components/common/*`、业务逻辑 |
| `src/app/` | `@domain/*`、`@/components/*`、`@/lib/*`、`@/hooks/*`、`@/store/*` | 第三方 UI 库（如 antd） |

## 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 目录 | kebab-case | `user-profile/`, `form-validation/` |
| React 组件文件 | kebab-case | `hitokoto-card.tsx` |
| UI 组件目录 | kebab-case + `/index.tsx` | `button/index.tsx` |
| React 组件 | PascalCase | `HitokotoCard` |
| 函数/变量 | camelCase | `getData`, `isLoading` |
| 常量 | UPPER_SNAKE_CASE 或 camelCase | `API_BASE_URL`, `defaultConfig` |
| 类型/接口 | PascalCase | `UserProfile`, `RequestOptions` |
