# packages/ui 协作准则（基础 UI 共享包）

`@kkfive/ui` 是基础 UI 共享包，存放 **shadcn 二次封装**与**自实现基础组件**（Button、Input、Dialog、Select 等），不含 antd。被各前端 app 消费。

继承根 `AGENTS.md` 全部规则，补充本包专属约束。与根级冲突时以本文件为准（但不违反根级硬性约束）。

<always-applicable>

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

</always-applicable>

<task-routing>

## 目录结构

```
packages/ui/
├── components/          # shadcn 二次封装 + 自实现基础组件（轻量，默认入口 re-export）
├── widgets/             # 重型渲染组件（PDF/图表等，默认入口不 re-export，需 dynamic + ssr:false）
├── tokens/              # 设计 token（颜色、间距、圆角）
├── utils/               # UI 工具函数（cn()、createIcon 等）
├── styles/              # 全局样式变量
└── package.json         # peerDependencies: { react, react-dom }
```

## widgets/（重型渲染组件）

`widgets/` 存放引入重型运行时依赖（如 `react-pdf`/`pdfjs`）的渲染组件。与 `components/`（轻量基础控件）分离，避免重型依赖污染所有消费 `@kkfive/ui` 的页面。

### 轻/重判断标准

| 归属 | 判断依据 |
|---|---|
| `components/`（轻量） | 依赖体积小（shadcn/Radix/Tailwind 级别），tree-shaking 后对消费方无负担；默认入口 re-export |
| `widgets/`（重型） | 引入 pdfjs、图表库、富文本等大体积运行时；或依赖浏览器 API（DOMMatrix 等）SSR 必须禁用 |

### 消费方式

- widgets 经独立子入口导出：`@kkfive/ui/widgets/<name>`（`package.json` 的 `exports` 显式声明）
- **默认入口（`src/index.ts`）不 re-export widgets**——消费方必须从子入口引入，隔离重型依赖
- 宿主端必须用 `dynamic(() => import('@kkfive/ui/widgets/...'), { ssr: false })` 懒加载
- worker / asset 路径由宿主注入，不在 widget 内硬编码

## 判断标准

| 放 `packages/ui` | 留在 `apps/*/src/components/` |
|---|---|
| Button、Input、Dialog、Select 等 shadcn 二次封装 | OrderTable、UserCard 等业务组件 |
| DataTable（通用排序/分页/筛选） | 特定业务的筛选面板 |
| 布局组件（Container、Stack） | 特定页面布局 |
| 图标系统、主题 token | 业务相关的颜色/样式覆盖 |
| —— | 基于 antd 的业务封装（antd 各 app 自治） |

Skill 的 meta 由工具自动注入。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
