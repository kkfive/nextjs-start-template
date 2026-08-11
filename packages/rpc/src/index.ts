/**
 * @kkfive/rpc —— 类型化 RPC 的泛型 hc 工厂与 envelope 解包。
 *
 * 纯框架无关能力：hc 客户端工厂（接收 app 注入的 HttpService）与 envelope 解包。
 * 路由类型和业务调用由各 app 自行组装。
 */
export { createRpcClient } from './rpc/client'
export { unwrapData } from './rpc/envelope'
