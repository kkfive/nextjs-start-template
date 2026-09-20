# Workflow: 先查后建（Search Before Create）

**触发**：新建组件、对接接口、定义类型/schema、封装 service/util 前。目标：避免重复造轮子；找到部分满足的已有实现时优先改造扩展，而非新建并行实现。

## 检索路径表

| 目标物 | 检索路径 | 检索关键词 |
|---|---|---|
| UI 基础组件 | `packages/ui/src/components/` + 包入口 | 组件名（Button/Dialog） |
| App 业务组件 | `apps/<app>/src/features/<feature>/components/` | 业务名词 |
| API schema | `packages/contracts/src/schemas/` + `index.ts` | 接口路径 / 数据实体名 |
| HTTP 封装 | `packages/http-client/src/` | 请求方法 / 拦截器类型 |
| RPC calls | `apps/<app>/src/features/<feature>/model/calls.ts` | 模块名 / 业务能力 |
| 工具函数 | `packages/utils/src/` | 函数行为（isXxx / format） |
| 类型定义 | 对应包的 `type.ts` + `packages/contracts/src/types/` | 类型名 |

检索方法：按上述明确路径用关键词搜索，重要搜索从定义与调用两个角度交叉验证，并检查对应 `index.ts` 的导出列表。

## 决策与记录

- 完全满足 → 直接复用；部分满足 → 改造扩展；能力重叠但签名不同 → 考虑统一，避免两套相似 API 并存
- 未找到 → 新建并在对应 `index.ts` / 包入口登记导出
- 在回应中说明：复用了什么（路径 + 导出名），或为什么新建（检索了哪些路径）
