---
name: styling-system
description: Ant Design + Tailwind 样式自定义体系。仅用于用户明确要求视觉/布局设计、theme/ConfigProvider、CSS Variables、Tailwind/SCSS class 方案、暗色模式、视觉覆盖或样式冲突；页面实现中的普通 className、Tailwind utility、表单布局、组件行为和无样式意图的页面任务不触发。
user-invocable: true
---

# Styling System

## Scope

- 用于用户明确要求的 Ant Design theme、CSS Variables、Tailwind/SCSS class 方案、视觉布局设计、暗色模式与样式冲突。
- 命中具体样式任务后，只读取 `Common Tasks` 中对应的一条 rule、workflow 或 reference。

## Avoid

- 页面为了结构或复用控件而写普通 `className`、Tailwind utility、表单布局不属于样式意图，不触发本 skill。
- 不默认读取全部 styling references；禁止全局覆盖 `.ant-*`、硬编码主题颜色或滥用 `!important`。

## Common Tasks

| 任务 | 一跳导航 |
|---|---|
| 选择合适的样式层级 | `workflows/choose-level.md` |
| 核对五级优先顺序 | `rules/priority-order.md` |
| 配置全局或组件主题 | `references/level-1-config-provider.md` |
| 实现主题切换或暗色模式 | `references/level-2-css-variables.md` |
| 调整单个组件实例 | `references/level-3-component-api.md` |
| 编写布局与工具类样式 | `references/level-4-tailwind.md` |
| 使用最后手段的 SCSS 覆盖 | `references/level-5-scss-fallback.md` |
| 对照典型方案 | `references/case-studies.md` |
| 排查优先级与覆盖陷阱 | `references/gotchas.md` |

## Semantic Principles

- 从影响范围最稳定的层级开始选择方案，避免为局部问题制造全局覆盖。
- 主题语义使用 token 或 CSS Variables 表达，不复制具体颜色值。
- 重复的组件级视觉决策上移到 ConfigProvider，单实例差异留在组件 API。
- SCSS 覆盖是最后手段，必须说明无法使用更稳定层级的原因。
