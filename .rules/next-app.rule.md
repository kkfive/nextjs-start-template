# Next App Rule

`src/app` 表达路由、布局和运行时入口，不承载可复用组件。

页面应组合已有 Domain、UI 和基础设施能力。可复用视图下沉到 `src/components`，业务能力下沉到 `domain`，请求实例和运行时适配放在 `src/service` 或 `src/lib`。

Server Component 是默认选择；只有交互、浏览器 API、客户端状态或 React Query hooks 需要时，才引入 `'use client'`。
