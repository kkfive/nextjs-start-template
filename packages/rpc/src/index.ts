/**
 * @kkfive/rpc —— 类型化 RPC（hc<AppType> 工厂 + envelope 解包 + 自有 api 共享 calls）。
 *
 * 纯框架无关能力：hc 客户端工厂（接收 app 注入的 HttpService）、envelope 解包、
 * 业务调用函数。不含 react-query / React，hooks 由各 app 自行组装。
 */
export { createRpcClient, type RpcClient } from './rpc/client'
export { unwrapData } from './rpc/envelope'
export { callScenario, callEnvelopeScenario } from './example-request/calls'
export { fetchHitokoto } from './example-hitokoto/calls'
