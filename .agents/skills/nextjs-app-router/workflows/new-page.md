# 新增页面 / 布局 / loading / error

文件约定（page/layout/loading/error 等）为 Next.js 框架通识，此处只列项目约束。

## 项目约束

- 路径：`apps/{app}/src/app/` 下，目录名即 URL 段
- `page.tsx` 默认 Server Component；`error.tsx` 必须 `'use client'`
- `params` / `searchParams` 是 Promise，必须 `await`（Next 15+）
- 页面只组合 feature 公开入口：不在页面写 `fetch`、业务 call、业务状态或可复用视图
- 基础 UI 直接来自 `@kkfive/ui/components/*`；antd 专属能力由 app 直接导入
- 仅为有共享 UI 的子树建 `layout.tsx`；为有失败可能的子树建 `error.tsx`

## 检查

- [ ] `params` / `searchParams` 已 `await`
- [ ] 数据获取留在 Server Component，向下传 props（跨边界值须可序列化）
- [ ] 页面无业务实现，只组合 feature 入口
- [ ] 有失败可能的子树有 `error.tsx`
