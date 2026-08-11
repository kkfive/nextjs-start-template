# Workflow: 先查后建（Search Before Create）

**触发条件**：任务涉及"新增/对接"类操作（新建组件、新对接接口、新定义类型/schema、新封装 service/util），或用户明确要求检索时。

**目标**：避免重复造轮子。新建前先确认项目是否已有同类实现可复用或改造。

## Step 1: 识别目标物类型

判断要新建的是什么：

| 目标物 | 典型场景 |
|---|---|
| UI 基础组件 | "新建一个 Button/Dialog/Select" |
| App 业务组件 | "新建订单列表/用户卡片" |
| API schema | "对接 /api/xxx 接口""定义用户数据结构" |
| HTTP 封装 | "封装请求拦截器""加 SSE 支持" |
| RPC calls | "写 hitokoto 的数据获取""封装请求调用" |
| 工具函数 | "写个判空函数""加个日期格式化" |
| 类型定义 | "定义用户类型""定义响应结构" |

## Step 2: 到对应目录检索

按目标物查对应目录和导出索引：

| 目标物 | 检索路径 | 检索关键词 |
|---|---|---|
| UI 基础组件 | `packages/ui/src/components/` + `packages/ui/src/index.ts` | 组件名（Button/Input/Dialog） |
| App 业务组件 | `apps/<app>/src/features/<feature>/components/` | 业务名词（订单/用户） |
| API schema | `packages/contracts/src/schemas/` + `index.ts` | 接口路径 / 数据实体名 |
| HTTP 封装 | `packages/http-client/src/` | 请求方法 / 拦截器类型 |
| RPC calls / Contracts schema | `apps/<app>/src/features/<feature>/model/calls.ts` + `packages/contracts/src/{module}/` | 模块名 / 业务能力；call 使用 `@/service/rpc-client` 或 `@/service/rpc-server` |
| 工具函数 | `packages/utils/src/` | 函数行为（isXxx / assertXxx / format） |
| 类型定义 | 对应包的 `type.ts` + `packages/contracts/src/types/` | 类型名 |

**检索方法**：先用 `maestro explore` 按关键词搜索上述明确路径；重要搜索从定义与调用等不同角度交叉检索。仅单命中时，再用 `rg` 与 Read 精确确认，同时检查对应 `index.ts` 的导出列表。

## Step 3: 评估并决策

- **找到已有实现** → 评估兼容性：
  - 完全满足需求 → 直接复用
  - 部分满足 → 改造扩展（优先改已有，而非新建并行实现）
  - 接口签名不同但能力重叠 → 考虑统一，避免两套相似 API 并存
- **未找到** → 新建，并在对应 `index.ts` / 包入口登记导出

## Step 4: 记录决策

在回应中说明：
- 复用了什么（路径 + 导出名）
- 或：为什么新建（检索了哪些路径，确认无同类）

## 示例

> 用户："帮我对接 /api/order/list 接口，返回订单列表"

1. 目标物：API schema（订单列表响应结构）
2. 检索：先用 `maestro explore` 在 `packages/contracts/src/schemas/` 搜 "order" / "订单"；单命中再用 `rg` 与 Read 确认
3. 决策：
   - 找到 `order-schema.ts` 已定义 `OrderListResponseSchema` → 复用，不重复定义
   - 未找到 → 在 `packages/contracts/src/schemas/` 新建，并登记到 `index.ts`
