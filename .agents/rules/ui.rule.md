# UI Rule

UI 层负责呈现、交互和组合，不重新实现业务规则。

基础 UI 组件（shadcn 二次封装、自实现控件）放在 `@kkfive/ui` 共享包；各 app 的 `src/components/ui/*` 作为项目 UI 入口。领域 UI 组件留在各 app 内，可连接 Domain 公共入口和基础 UI 组件，但应避免深链依赖 Controller 或 Service 的内部文件。通用组件不绑定具体业务模块。

`@kkfive/ui` 不含 antd；antd 由各 app 按需自行安装，ConfigProvider 与主题 token 各 app 自治。业务代码依赖项目 UI 入口，而不是直接依赖第三方组件 API。

交互组件显式声明客户端边界；没有交互、浏览器 API 或客户端状态需求时，优先保持 Server Component。
