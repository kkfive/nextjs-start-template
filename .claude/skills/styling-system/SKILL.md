---
name: styling-system
description: Ant Design + Tailwind 样式自定义体系 - 5 级优先级（ConfigProvider → CSS Variables → 组件 API → Tailwind → SCSS）、主题切换、暗色模式、避免类名覆盖。用于调全局主题、做多主题切换、单实例样式、修复样式冲突、解决 `!important` 滥用。
user-invocable: true
---

# Styling System

## Scope
- Target: Ant Design 5.x+ / Tailwind 在本项目的样式自定义
- Cover: 5 级优先级体系、主题切换、暗色模式、决策流程
- Avoid: 覆盖 `.ant-*` 全局类名、硬编码颜色、滥用 `!important`

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 不确定该用哪种方案 | `workflows/choose-level.md` |
| 5 级优先级硬约束 | `rules/priority-order.md` |
| 1. ConfigProvider（全局/组件类主题） | `references/level-1-config-provider.md` |
| 2. CSS Variables（主题切换/暗色） | `references/level-2-css-variables.md` |
| 3. 组件 API（单实例、styles/classNames） | `references/level-3-component-api.md` |
| 4. Tailwind className | `references/level-4-tailwind.md` |
| 5. SCSS 覆盖（最后手段） | `references/level-5-scss-fallback.md` |
| 看 5 个典型案例 | `references/case-studies.md` |
| 踩坑速查 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 覆盖 `.ant-btn` 全局类 | ConfigProvider `theme.components.Button` |
| `!important` | 提高选择器权重 / 升级到 ConfigProvider |
| 硬编码颜色 `#1e40af` | `var(--platform-primary)` |
| 每个按钮都写一遍 `className` | ConfigProvider 统一 |
| 内联 `style` 写复杂布局 | className + Tailwind |
| SCSS 覆盖无注释 | 必须注释覆盖原因 |

## Session Discipline

每次进入样式任务时**重新阅读 `rules/priority-order.md`**。绕过优先级是项目最常见的样式回归来源。

## 相关 Skills

- `/ant-design`：组件 API 查询与 SSR 配置
- `/coding-standards`：UI 导入规则
