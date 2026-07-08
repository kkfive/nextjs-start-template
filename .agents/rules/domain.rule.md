# Domain Rule

各 app 的 `domain/` 是运行环境适配层，核心业务逻辑下沉到 `@kkfive/domain-core` 共享包。适配层负责 re-export 共享包的 Service/Controller/Type、注入该 app 的运行环境（浏览器或服务端 HttpService 实例），并按需补充环境专属能力（如 Next.js apps 的 React Query hooks）。

HTTP 实例由调用方注入，Domain 不直接选择具体实例。共享包的 Service 负责原始请求，Controller 负责业务编排、数据转换和错误语义；调用方通过模块入口使用公共 API。`apps/api`（Hono）同进程直调 Controller，不经过 HttpService。

外部请求返回的数据不可信。接口响应的任意字段都可能缺失或为 `null`；原始响应类型应使用共享工具类型表达这一点，Controller 再将其归一化为业务可用类型。不要为了适配外部响应把业务模型字段批量改成 `?:`。

共享包核心逻辑必须框架无关，禁止依赖 React、Next.js 或 Hono。React Query 等 hooks 是各 Next.js app 适配层的职责，不进共享包；`apps/api` 的适配层无 hooks、无 HttpService 注入。

类型、常量、Service、Controller 的组织方式服务于模块边界，而不是为了填满模板。新增文件应来自真实职责，重复出现的结构再沉淀为约定。
