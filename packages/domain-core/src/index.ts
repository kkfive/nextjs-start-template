/**
 * @kkfive/domain-core —— 业务纯逻辑（框架无关）。
 *
 * Service/Controller 第一参数注入 HttpService 实例（来自 @kkfive/http-client），
 * 由各 app 的 Domain 适配层决定注入浏览器实例还是服务端实例。
 * apps/api（Hono）同进程直调 Controller，不经 HttpService。
 *
 * 禁止依赖 React / Next.js / Hono；React Query hooks 留各 Next.js app 适配层。
 *
 * 各业务模块通过子路径消费，例如：
 *   import { Controller } from '@kkfive/domain-core/example/hitokoto'
 * （各模块都导出 Controller/service 命名空间，根入口不 re-export 以避免命名冲突）
 */
