/**
 * @kkfive/biz —— 前端业务包（hc RPC 类型化调用 + 业务垂直内聚）。
 *
 * 主入口只暴露框架无关能力：hc 客户端工厂、envelope 解包、业务调用函数。
 * React Query hooks（依赖 @tanstack/react-query）在 './example-*' sub-entry，
 * 让 SSR / 非 React-Query 消费方（如 admin）不被迫引入 react-query。
 */
export { createBizClient, type BizClient } from './rpc/client'
export { unwrapData } from './rpc/envelope'
export { callScenario, callEnvelopeScenario } from './example-request/calls'
export { fetchHitokoto } from './example-hitokoto/calls'
