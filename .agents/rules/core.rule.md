# Core Rule

本项目的规范以稳定原则为源头，具体枚举交给校验脚本和少量示例。

仓库采用 monorepo 结构，分为 `apps/`（独立应用）、`packages/`（共享能力）、`internal/`（工具链配置）三层。应用之间不互相依赖；共享包保持通用，不绑定特定业务。业务能力默认留在所属 app，出现真实的跨 app 通用需求后才提取到共享包。

Next.js app 采用 Feature-first：业务视图、calls、hooks、状态、页面模型和纯逻辑聚合在 `src/features/<feature>/`。`src/app/` 仅组合 feature 入口和路由能力；`src/service/` 只创建 HTTP/RPC/SSE 运行时实例并隔离浏览器/服务端边界。跨层调用应依赖稳定入口，避免深链到内部实现文件。

组件应使用可搜索、可重构的函数声明导出。类型定义优先使用 `type`，让数据形状以组合方式演进。UI 能力应通过项目 UI 入口（各 app 的 `src/components/ui/*`，底层来自 `@kkfive/ui`）进入业务代码，避免应用层直接绑定第三方 UI 库。

文档负责解释原则、背景和取舍；`.agents/rules` 负责沉淀高频原则；`.agents/skills` 负责按任务引导；脚本负责执行可检查的细则。

新增可复用定义前，先检索项目是否已有同类实现。已有则复用或改造，无则新增并登记到对应导出入口。
