# packages/ui 增量规则

- 只收纳跨 app 可直接使用且不含业务语义的 UI。
- 重型运行时或浏览器 API 组件放 `widgets/` 独立子入口，不进入默认入口；worker/asset 由宿主注入，SSR 开关由宿主决定。
