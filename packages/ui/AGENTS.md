# packages/ui 增量规则

`@kkfive/ui` 提供跨应用基础 UI，不包含业务组件或 antd。

- 只收纳换到其他 app 仍可直接使用的基础组件、布局、图标与 token；业务 UI 留在 app feature。
- React/React-DOM 使用 peerDependencies；禁止依赖 apps、业务逻辑或 antd。
- 轻量组件由默认入口导出；引入重型运行时或浏览器 API 的组件放 `widgets/`，经独立子入口导出且不进入默认入口。
- widget 的 worker/asset 路径由宿主注入；需要关闭 SSR 时由宿主 dynamic import。

通用 package 生命周期由 `.agents/rules/packages.rule.md` 负责；app 侧 UI 消费由 `.agents/rules/ui.rule.md` 负责。
