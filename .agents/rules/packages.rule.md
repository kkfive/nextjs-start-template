# Packages Rule

`packages/*` 通过 `package.json` 的 `exports` 直接指向源码，不产出 build 产物；由消费方（Next.js `transpilePackages` / Hono tsx）编译。每个 package 的 `tsconfig.json` 继承 `@kkfive/tsconfig/base.json`，启用 `composite: true` 并经 `references` 声明依赖的 workspace 包，让根级 `tsc --build` 跨包增量检查。

依赖必须完整且最小：只声明真正使用的依赖；运行时框架（React 等）走 peerDependencies。包内路径别名（`@/*`）各包自身 tsconfig 定义、不跨包；跨包引用统一走 `@kkfive/<pkg>` workspace 协议。新增 package 必须在根 `pnpm-workspace.yaml` 与 `tsconfig.json` references 注册。

## 包分类与红线

| 包 | 职责 | 红线 |
|---|---|---|
| `contracts` | zod schema + infer 类型 + 错误类型，全栈契约源 | 框架无关、零运行时依赖（仅 zod） |
| `ui` | 基础 UI 控件（shadcn 二次封装 + 自实现） | 不含 antd；React 走 peer |
| `utils` | 多端通用算法 | `common`（多端）/ `dom`（浏览器）物理隔离，服务端只引 common |
| `http-client` | HttpService 抽象 + interceptor + BusinessError | 底层 fetch；不绑业务 |
| `biz` | 前端业务（hc RPC hooks + 业务组件，垂直内聚） | 依赖 contracts/ui/http-client + api AppType（type-only）；含 React |

## README 强制

每个 package 必须有 `README.md`，说明该包的作用、依赖红线、消费方式——作为防架构偏移的锚点。新增 package 不带 README 视为不完整。
