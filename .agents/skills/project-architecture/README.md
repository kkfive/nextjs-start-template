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
- **应用内分层**：Feature-first、运行时 service、跨 feature UI、路由组合
- **依赖规则**：跨包与应用内的导入限制
- **目录约定**：文件和目录组织规范
- **命名规范**：文件、目录、代码标识符命名

## 快速示例

### monorepo 三层

```
apps/                → 独立应用（client / admin / api，各自 build/deploy）
packages/            → 共享包（contracts / http-client / rpc / utils / ui）
internal/            → 工具链配置预设
```

### 应用内分层（Next.js apps）

```
apps/{app}/src/features/       → 业务视图、calls、hooks、状态、模型
apps/{app}/src/service/        → HTTP/RPC/SSE 运行时实例（双实例物理隔离）
apps/{app}/src/components/     → 跨 feature 的通用 UI（含 ui 入口）
apps/{app}/src/app/            → 页面路由层，仅组合 feature 入口
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
