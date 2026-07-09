# 关键词扩展规则

从用户输入产生 3-5 个搜索关键词。

## 扩展维度

| 维度 | 例子（输入 "settings"） |
|---|---|
| 原词 | `settings` |
| 同义词 | `gear`、`cog`、`config`、`preferences` |
| 拆复合词 | "上传图标" → `upload`、`cloud-upload` |
| 风格后缀 | `settings-line`、`settings-outline`、`settings-filled` |
| 概念近邻 | `tool`、`option`、`control` |

## 示例

| 输入 | 关键词集 |
|---|---|
| settings | settings, gear, cog, config, preferences |
| user | user, account, person, profile, avatar |
| home | home, house, dashboard |
| 删除 | delete, trash, remove, bin |
| 上传 | upload, cloud-upload, file-up |
| 搜索 | search, magnify, find, lens |

## 中英文混合

中文输入先翻成英文，再扩展：

```
"设置" → settings → [settings, gear, cog, config]
"用户" → user → [user, account, person, profile]
```

## 上限与下限

- 最少 3 个（覆盖度不足易漏命中）
- 最多 5 个（再多浪费请求且结果重叠）
- 同义词去重（如 `setting` 与 `settings` 取其一）

## 检查

- [ ] 关键词数 3-5
- [ ] 至少包含 1 个同义词
- [ ] 中文输入已转英文
- [ ] 无重复或几乎重复词
