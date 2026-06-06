# Domain Rule

Domain 层表达业务能力，不拥有具体运行环境。

HTTP 实例由调用方注入，Domain 不直接选择 client、server 或 base 实例。Service 负责原始请求，Controller 负责业务编排、数据转换和错误语义，调用方通过模块入口使用公共 API。

外部请求返回的数据不可信。接口响应的任意字段都可能缺失或为 `null`；原始响应类型应使用共享工具类型表达这一点，Controller 再将其归一化为业务可用类型。不要为了适配外部响应把业务模型字段批量改成 `?:`。

Domain 核心逻辑应尽量保持框架无关。当前 `hooks.ts` 是运行环境适配层例外：它可以封装 React Query，但只应调用 Domain 公共入口并注入客户端 HTTP 实例。

类型、常量、Service、Controller 和 Hooks 的组织方式服务于模块边界，而不是为了填满模板。新增文件应来自真实职责，重复出现的结构再沉淀为约定。
