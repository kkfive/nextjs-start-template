# Core Rule

`src/lib` 与 `src/config` 只承载 app 级、非业务基础设施。跨层调用使用稳定公开入口；新增定义前检索已有实现。
