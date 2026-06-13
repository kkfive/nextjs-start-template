---
name: searches-iconify
description: 通过 Iconify API 搜索图标 - 关键词生成、并行搜索、结果聚合、推荐排序、标准模板输出。用于在 Iconify 图集中查找图标、为组件选定 icon name；不包含图标下载、自定义图标集或图标编辑。
user-invocable: true
---

# Iconify 图标搜索

## Scope
- Target: Iconify API 图标搜索
- Cover: 关键词生成、并行搜索、聚合排序、模板化输出
- Avoid: 下载图标文件、编辑图标、自定义图标集

## Common Tasks

| 触发场景 | 路由 |
|---|---|
| 端到端执行搜索 | `workflows/search-icons.md` |
| 关键词如何扩展 | `rules/keyword-expansion.md` |
| 必须并行搜索 | `rules/parallel-execution.md` |
| 输出格式模板 | `references/output-template.md` |
| 踩坑：分多次响应、不去重 | `references/gotchas.md` |

源头表见 `routing.yaml`。

## 反模式速查

| ❌ 不要 | ✅ 应该 |
|---|---|
| 分多次响应执行 curl | 同一响应中并行所有关键词 |
| 跳过关键词扩展直接查原词 | 生成 3-5 个变体（同义、拆词、风格后缀） |
| 不去重就输出 | 跨结果去重 |
| 输出添加额外描述 | 严格按 `references/output-template.md` |
| 给 0 结果不标记 | 标记 "(找到 0 个)" 便于后续重试 |

## Session Discipline

每次调用本 skill 时**重新阅读 `rules/parallel-execution.md`**：并行规则是搜索质量的核心。

## 相关 Skills

- `/coding-standards`：图标在项目中的使用规范（`@/components/ui/icon`、Iconify + Tailwind）
