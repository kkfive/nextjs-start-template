# 端到端搜索 Iconify 图标

## 步骤

1. **生成关键词**：见 `rules/keyword-expansion.md`，从用户输入产生 3-5 个变体
2. **并行调用 Iconify API**：见 `rules/parallel-execution.md`，所有关键词必须在同一响应中并发
3. **等待全部完成**再继续
4. **聚合**：去重、按出现频率排序、标记空结果
5. **格式化输出**：严格按 `references/output-template.md`

## API

```
https://api.iconify.design/search?query=<keyword>&limit=20
```

返回结构（简化）：
```json
{
  "icons": ["mdi:settings", "lucide:settings", "tabler:settings"],
  "total": 123
}
```

## 调用示例（并行）

```bash
# ✅ 同一响应内并发
curl -s "https://api.iconify.design/search?query=settings&limit=20"
curl -s "https://api.iconify.design/search?query=gear&limit=20"
curl -s "https://api.iconify.design/search?query=cog&limit=20"
curl -s "https://api.iconify.design/search?query=config&limit=20"
```

## 聚合规则

- 把所有结果汇总
- 去重（按 `collection:name`）
- 频率排序：在多个关键词中都出现的图标排前
- 标记每组的"找到 X 个"，0 个明示
- 推荐前 5 个高频跨关键词的图标

## 检查

- [ ] 关键词 ≥ 3 个
- [ ] 所有 curl 在同一响应中并发
- [ ] 等所有完成才进入聚合
- [ ] 输出严格遵循模板
- [ ] 推荐项可直接复制使用
