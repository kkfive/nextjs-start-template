# UI Rule

UI 层负责呈现、交互与组合，不重新实现业务规则。

基础 UI 控件统一来自 `@kkfive/ui`（shadcn 二次封装 + 自实现）。**业务代码直接消费 `@kkfive/ui/components/*`**，不在 app 内做零价值的 re-export 透传层（`export * from '@kkfive/ui/...'` 即 anti-pattern）。仅当存在真实加工（改默认 props、限制 API、注入主题、组合多控件）时才在 app 内封装，且封装必须含实现，不做纯 re-export。

`@kkfive/ui` 不含 antd；antd 由各 app 按需安装，ConfigProvider 与主题 token 各 app 自治。业务代码可直接使用 antd（antd 是 app 的合法 UI 依赖）；用 antd 独有能力（Form/Table/Upload 等）时直接 import，基础控件优先 `@kkfive/ui` 减少重复。

领域 UI 组件留各 app 或 `packages/biz`（耦合业务的），可连接 biz 公共入口与基础 UI，避免深链内部实现文件。交互组件显式声明客户端边界；无交互、浏览器 API 或客户端状态需求时，优先 Server Component。
