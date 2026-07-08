# packages/ui 协作准则（基础 UI 共享包）

本文件继承根 `AGENTS.md` 的全部规则，并补充 `packages/ui` 的专属约束。当本文件与根级冲突时，以本文件为准（但仍不可违反根级硬性约束）。

## 定位

`@kkfive/ui` 是基础 UI 共享包，存放 **shadcn 二次封装**与**自实现基础组件**（Button、Input、Dialog、Select、DataTable 等），不含 antd。被各 Next.js app（client / admin）消费。

## Always Load（继承 + 补充）

@.agents/rules/core.rule.md
@.agents/rules/monorepo.rule.md
@.agents/rules/packages.rule.md
@.agents/rules/ui.rule.md

## 关键约束

### 通用性

- **只放真正可复用的基础组件**：Button、Input、Dialog、Select、布局组件、图标系统、主题 token
- **不放业务组件**：`OrderTable`、`UserSearchSelect` 等业务组件留在各 app 的 `src/components/domain/`
- 判断标准：换一个新项目还能直接用 → 放这里；只服务特定业务 → 留 app 内

### 不含 antd

- 本包**不依赖、不封装 antd**；antd 及 `@ant-design/*` 由各 app 按需自行安装
- ConfigProvider / theme token 各 app 自治，避免与 app 内 antd 体系冲突

### 依赖约束

- React / React-DOM 声明为 **peerDependencies**（不打包进产物）
- 可依赖 shadcn/Radix、Tailwind 等基础 UI 依赖
- **禁止**依赖任何 `apps/*`、业务逻辑、`@kkfive/contracts`（除非纯类型）、antd

### 源码消费

- `package.json` 的 `exports` 指向 `src/index.ts`（不预 build）
- 各 Next.js app 通过 `transpilePackages` 消费源码
- 组件文件按需声明 `'use client'`，由 Next.js 自动处理 client boundary

## 目录结构

```
packages/ui/
├── components/          # shadcn 二次封装 + 自实现基础组件
├── tokens/              # 设计 token（颜色、间距、圆角）
├── utils/               # UI 工具函数（cn()、createIcon 等）
├── styles/              # 全局样式变量
└── package.json         # peerDependencies: { react, react-dom }
```

## 判断标准

| 放 `packages/ui`                                 | 留在 `apps/*/src/components/`            |
| ------------------------------------------------ | ---------------------------------------- |
| Button、Input、Dialog、Select 等 shadcn 二次封装 | OrderTable、UserCard 等业务组件          |
| DataTable（通用排序/分页/筛选）                  | 特定业务的筛选面板                       |
| 布局组件（Container、Stack）                     | 特定页面布局                             |
| 图标系统、主题 token                             | 业务相关的颜色/样式覆盖                  |
| ——                                               | 基于 antd 的业务封装（antd 各 app 自治） |

## 参考

- 根级规范：`../../AGENTS.md`
- 新建共享包引导：`.agents/skills/create-package/SKILL.md`
- 重构决策：`docs/decisions/monorepo-restructuring.md`
