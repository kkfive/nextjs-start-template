# Packages Rule

`packages/*` 通过 `package.json` 的 `exports` 直接指向源码，不产出 build 产物；由消费方编译。每个 package 的 `tsconfig.json` 继承 `@kkfive/tsconfig/base.json`，包级 typecheck 由 Turbo 从根入口统一调度。

依赖必须完整且最小：只声明真正使用的依赖；运行时框架（React 等）走 peerDependencies。包内路径别名不跨包，跨包引用统一走 `@kkfive/<pkg>` 与 `workspace:*`。新增 package 需提供 manifest、源码 export、tsconfig、README，并在根 `tsconfig.json` references 登记。

## 包分类与红线

| 包 | 职责 | 红线 |
|---|---|---|
| `contracts` | zod schema + infer 类型 + 错误类型，全栈契约源 | 框架无关、零运行时依赖（仅 zod） |
| `ui` | 基础 UI 控件（shadcn 二次封装 + 自实现） | 不含 antd；React 走 peer |
| `utils` | 多端通用算法 | `common`（多端）/ `dom`（浏览器）物理隔离，服务端只引 common |
| `http-client` | HttpService 抽象 + interceptor + BusinessError | 底层 fetch；不绑业务 |
| `rpc` | 泛型 `createRpcClient<App>()` + envelope 解包；不含业务 calls、React 或 app 类型 | 依赖 contracts/http-client；AppType 与实例均由 app 注入 |

## README 强制

每个 package 必须有 `README.md`，说明该包的作用、依赖红线、消费方式——作为防架构偏移的锚点。新增 package 不带 README 视为不完整。
