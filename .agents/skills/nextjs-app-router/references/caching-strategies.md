# 缓存与失效（项目约定）

Next 缓存 API（`fetch` 选项、`revalidateTag/Path`、路由段配置）为框架通识，此处不重复；只留项目决策。

## 项目约定

- **写端必须失效**：Server Action / Route Handler 变更数据后，必须 `revalidateTag` 或 `revalidatePath`，漏掉即页面旧值（本仓最高频 bug 来源）
- **tag 命名**：`{domain}:list` / `{domain}:detail:{id}`（如 `material:list`、`material:detail:123`）；读端 fetch 用 `next: { tags }` 声明，写端按 tag 失效
- **默认动态**：Route Handler 默认不加缓存；仅读端且数据稳定才加
- `next: { tags }` 仅 Server 端 fetch 生效，Client Component 的 fetch 不受 next 缓存管理

## 选择

| 场景 | 选择 |
|---|---|
| 数据频繁变化、需立即可见 | `cache: 'no-store'` |
| 数据稳定、变更可控 | `tags` + Server Action `revalidateTag` |
| 数据周期变化 | `next.revalidate` 秒数 |

故障排查见 `gotchas.md` 缓存节。
