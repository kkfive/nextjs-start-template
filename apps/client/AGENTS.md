# apps/client 增量规则

- antd 由 client 自治，不进入 `@kkfive/ui`；跨 feature 封装放 `src/components/`，专属封装留在 feature。
- 新增环境变量同时登记 `src/config/env.ts` 与 `.env.example`。
