---
name: searches-iconify
description: 搜索 Iconify API 图标。用于查找、搜索或发现 Iconify 图标集中的图标。
user-invocable: true
---

# Iconify 图标搜索

## S - Scope（范围）
- Target: Iconify API 图标搜索
- Cover: 关键词生成、并行搜索、结果聚合、推荐排序
- Avoid: 图标下载、图标编辑、自定义图标集

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
Iconify API | API 文档和使用方法 | https://iconify.design/docs/api/

## P - Process（流程）
1. **生成关键词**: 从用户输入生成 3-5 个关键词变体（同义词、拆分复合词、添加样式后缀）
2. **并行搜索**: 使用所有关键词并行执行 curl 请求（必须在同一响应中）
3. **等待完成**: 等待所有搜索完成后再进行下一步
4. **聚合结果**: 去重、按出现频率排序、标记空结果
5. **格式化输出**: 使用标准模板输出结果

## O - Output（输出）
- 搜索关键词列表
- 按关键词分组的图标结果表格
- 推荐图标列表（带预览和使用代码）
- 所有输出必须严格遵循模板格式

## 快速参考

### 关键词生成规则

```
输入: "settings"
输出:
- settings (原词)
- gear (同义词)
- cog (同义词)
- config (同义词)
- settings-line (样式后缀)
```

### 并行搜索模式

```bash
# ✅ 正确：所有搜索在同一响应中并行执行
curl -s "https://api.iconify.design/search?query=settings&limit=20"
curl -s "https://api.iconify.design/search?query=gear&limit=20"
curl -s "https://api.iconify.design/search?query=cog&limit=20"

# ❌ 错误：分多次响应执行
# 第一次响应执行 settings
# 第二次响应执行 gear
```

### 输出模板

```markdown
## 搜索关键词

[keyword1, keyword2, keyword3]

## 搜索结果

### "keyword1" (找到 X 个图标)

| 图标名称 | 图标集 | 预览 |
|---------|--------|------|
| icon-name | collection | ![](https://api.iconify.design/collection:icon-name.svg) |

### "keyword2" (找到 X 个图标)

| 图标名称 | 图标集 | 预览 |
|---------|--------|------|
| icon-name | collection | ![](https://api.iconify.design/collection:icon-name.svg) |

## 推荐

1. **collection:icon-name** - `<iconify-icon icon="collection:icon-name" />` ![](https://api.iconify.design/collection:icon-name.svg)
2. **collection:icon-name** - `<iconify-icon icon="collection:icon-name" />` ![](https://api.iconify.design/collection:icon-name.svg)
```

### 反模式

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| 分多次响应执行搜索 | 所有搜索在同一响应中并行 | 效率低，用户体验差 |
| 在模板外添加额外文本 | 严格遵循模板格式 | 输出格式不一致 |
| 跳过关键词生成 | 生成 3-5 个变体 | 搜索结果不全面 |
| 不去重结果 | 跨搜索去重 | 重复图标混淆用户 |

## 相关 Skills

- /coding-standards: 图标使用规范（Iconify + Tailwind）
