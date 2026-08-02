# Core Rule

`src/lib` 与 `src/config` 只承载 app 级、非业务基础设施。业务归属、路由、service、UI 与跨包方向分别由对应 owner rule 定义。

跨层调用依赖稳定公开入口；新增定义前先检索已有实现。类型与组件的机械写法由 ESLint、TypeScript 和 `coding-standards` 负责，不在此重复。
