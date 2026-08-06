# Feature Rule

业务视图、calls、hooks、store、页面模型与私有测试归所属 feature。

仅在已有多个真实消费者时提升：app 内共享 UI 放 `src/components/`；跨 app 且框架无关的能力才进入 package。跨 feature 依赖使用其公开入口。
