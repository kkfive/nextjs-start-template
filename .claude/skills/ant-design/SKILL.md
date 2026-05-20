---
name: ant-design
description: Ant Design 6.x 组件选择、ConfigProvider/主题、CSS-in-JS、SSR、Form/Table/Select/Tree/Upload 高级用法。用于构建或审查 antd UI、配置主题、解决 Ant Design 在 Next.js/SSR/性能/无障碍方面的问题；强制使用前查最新官方 API。
user-invocable: true
---

# Ant Design

## Scope
- Target: antd@^6 + React 18-19（本项目为 React 19）
- Cover: 核心组件、Token/主题、CSS-in-JS、SSR、Form/Table/Select/Tree/Upload 高级模式
- Avoid: Pro 路由/布局（去 `ant-design-pro`）；AI 聊天 UI（去 `ant-design-x`）

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 使用任何组件前 | `rules/api-query-required.md` ⚠️ 必读 |
| 在业务代码中引入 antd 组件 | `rules/ui-import.md` |
| 初始化项目：ConfigProvider + 主题 | `workflows/setup-config-provider.md` |
| Next.js SSR 样式顺序 | `workflows/nextjs-ssr.md` |
| v6 新特性、迁移说明 | `references/antd-v6.md` |
| 遗留 v5 项目 | `references/antd-v5.md` |
| Form 动态/依赖/性能 | `references/form-advanced.md` |
| Table 排序/过滤/虚拟化 | `references/table-advanced.md` |
| Select 远程搜索/标签 | `references/select-advanced.md` |
| Tree 异步加载/checkStrictly | `references/tree-advanced.md` |
| Upload 受控/自定义请求 | `references/upload-advanced.md` |
| 踩坑：rowKey/destroyOnClose/StyleProvider | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 直接覆盖 `.ant-btn` 类名 | 用 ConfigProvider `theme.components` |
| `import { Button } from 'antd'`（业务代码） | `import { Button } from '@/components/ui/button'` |
| Table 不设 `rowKey` | 稳定的 `rowKey="id"` |
| Modal 不用 `destroyOnClose` | `<Modal destroyOnClose>` |
| SSR 不加 StyleProvider | 加 StyleProvider 保证样式顺序 |
| 假设 API 存在不查文档 | 先 WebFetch / WebSearch 官方 API |

## Session Discipline

每次进入 antd 任务时**重新阅读 `rules/api-query-required.md`**：组件 API 在 v6 期间持续演进，绝不能凭训练数据猜。

## 相关 Skills

- `/styling-system`：样式 5 级优先级（ConfigProvider → CSS Vars → 组件 API → Tailwind → SCSS）
- `/coding-standards`：UI 导入规范（`@/components/ui/*`）
- `/nextjs-app-router`：Server Component 边界与 SSR
