# apps/admin 增量规则

Next.js App Router 管理后台示例，以 SSR 直取为主。

- 页面默认 Server Component；SSR 首屏数据由所属 feature 的 server call 获取。
- 示例结构按真实需求增长，不创建空 feature 或预设分层。
- 跨 feature 通用 UI 才进入 `src/components/`；`src/lib/` 只放 app 级基础设施。

路由与通用边界由根 `AGENTS.md` 及对应 owner rule 负责。
