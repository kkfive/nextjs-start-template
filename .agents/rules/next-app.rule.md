# Next App Rule

`src/app` 表达路由、布局与 runtime 入口；业务能力和可复用视图留在 feature 或 app 共享组件。page/layout 的可机械边界由 FFG02 校验。

默认使用 Server Component，仅把需要交互、浏览器 API 或客户端状态的最小边界声明为 Client。跨边界只传可序列化数据；首屏读取、客户端查询与写入后的缓存失效必须形成闭环。

Route Handler 只承担 app 内轻量 BFF、聚合与转发；独立后端能力进入 `apps/api`。Route Handler、Server Action、缓存、导航或水合变化使用对应 runtime 证据，必要时真实浏览器验收。
