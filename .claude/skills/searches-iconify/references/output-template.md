# 输出模板

输出必须严格遵循以下格式，不要加任何 prefix / suffix 说明文本。

```markdown
## 搜索关键词

[keyword1, keyword2, keyword3, keyword4]

## 搜索结果

### "keyword1" (找到 X 个图标)

| 图标名称 | 图标集 | 预览 |
|---------|--------|------|
| icon-name | collection | ![](https://api.iconify.design/collection:icon-name.svg) |
| ... | ... | ... |

### "keyword2" (找到 X 个图标)

| 图标名称 | 图标集 | 预览 |
|---------|--------|------|
| ... | ... | ... |

### "keyword3" (找到 0 个图标)

无结果。

## 推荐

1. **collection:icon-name** — `<iconify-icon icon="collection:icon-name" />` ![](https://api.iconify.design/collection:icon-name.svg)
2. **collection:icon-name** — `<iconify-icon icon="collection:icon-name" />` ![](https://api.iconify.design/collection:icon-name.svg)
3. ...
```

## 字段说明

- **搜索关键词**：JSON 风格数组，无引号
- **每组结果**：标题含 "(找到 X 个图标)"；0 个写 "无结果"
- **预览图**：`https://api.iconify.design/{collection}:{name}.svg`
- **推荐**：前 5 个跨关键词高频的图标，附可直接复制的组件用法

## 推荐项的"组件用法"

按项目实际选用：

- React iconify-icon Web Component：`<iconify-icon icon="mdi:settings" />`
- 项目自封装：`<Icon name="mdi:settings" />`（如果有 `@/components/ui/icon`）
- Tailwind + CSS Mask 方案见 `/coding-standards` 的图标使用规范

## 约束

- 不加"以下是搜索结果"等导语
- 不加"如果还需要别的请告诉我"等结尾
- 严格按模板节奏：关键词 → 各组结果 → 推荐
