# Feature Rule

业务视图、calls、hooks、store、页面模型与 feature 私有测试归入 `src/features/<feature>/`；只被该 feature 使用的代码不提升到通用目录。

跨 feature 共享前先确认多个真实消费者：app 内共享 UI 放 `src/components/`，跨 app 且框架无关的能力才进入 package。依赖其他 feature 时使用其公开入口，不建立兼容 re-export 或双写目录。

行为证据优先覆盖用户可观察状态、错误兜底和业务不变量；通用证据流程由 `evidence-first-development` 负责。
