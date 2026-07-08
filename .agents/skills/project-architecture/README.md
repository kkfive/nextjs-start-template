# Project Architecture Skill

项目架构和组织规范 Skill

## 用途

提供项目架构、目录约定、命名规范等组织规范。

## 使用场景

- 创建新模块或组件
- 组织项目结构
- 文件和目录命名
- 理解架构分层
- 解决依赖问题

## 调用方式

```
/project-architecture
```

## 包含内容

- **monorepo 三层**：apps（独立应用）/ packages（共享包）/ internal（工具链配置）
- **应用内分层**：Domain 适配层、基础设施、UI、路由
- **依赖规则**：跨包与应用内的导入限制
- **目录约定**：文件和目录组织规范
- **命名规范**：文件、目录、代码标识符命名

## 快速示例

### monorepo 三层

```
apps/                → 独立应用（client / admin / api，各自 build/deploy）
packages/            → 共享包（contracts / domain-core / http-client / utils / ui）
internal/            → 工具链配置预设
```

### 应用内分层（Next.js apps）

```
apps/{app}/domain/              → Domain 适配层 (re-export @kkfive/domain-core + 注入 HttpService)
apps/{app}/src/lib/             → 基础设施层
apps/{app}/src/components/ui/   → 基础 UI（来自 @kkfive/ui）
apps/{app}/src/components/domain/ → 业务 UI
apps/{app}/src/app/             → 页面路由层
```

### 命名规范

```
目录: kebab-case (user-profile/)
React 组件文件: kebab-case (hitokoto-card.tsx)
React 组件: PascalCase (HitokotoCard)
函数/变量: camelCase (getData, isLoading)
类型/接口: PascalCase (UserProfile)
```

## 相关文档

- `references/architecture-overview.md` - 完整架构文档
- `references/directory-structure.md` - 目录约定
- `references/naming-conventions.md` - 命名规范
