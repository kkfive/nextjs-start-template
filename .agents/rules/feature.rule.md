# Feature Rule

Next.js app 的业务能力按 `src/features/<feature>/` 聚合。一个 feature 可包含视图组件、页面模型、业务 calls、hooks、store、纯逻辑及其内部测试；只被该 feature 使用的代码不得分散到 `src/app/`、`src/service/` 或通用目录。

`src/app/**/page.tsx` 与 `layout.tsx` 仅导入并组合 feature 公开入口、路由元数据和 Next.js 路由能力。它们不得定义可复用视图、业务状态、请求 call 或业务编排。

跨 feature 的共享应先确认有真实的多个消费者；可复用 UI 放 `src/components/` 或 `@kkfive/ui`，跨 app 的通用能力才放 `packages/`。不得以 re-export、旧路径、旧 alias 或双写目录保留迁移兼容层。
