# HTTP Request Examples - 完整实施计划

> **方案**：方案 A - 扩展现有 domain/example/request
> **Codex SESSION**: 019be09e-c536-7770-90fc-194de597e7f9
> **Gemini SESSION**: 6e67b7e3-47d9-4232-bcd7-41472650ea29
> **批准日期**: 待批准

---

## 📋 项目概述

创建 HTTP 请求处理的综合示例，展示 @kkfive/request 在 Next.js 全栈环境下的能力：
- ✅ 成功请求（拦截器 vs 原始数据）
- ⚠️ 业务错误（HTTP 200 but code ≠ 200）
- ⛔ HTTP 错误（4xx, 5xx）
- 🖥️ 服务端 vs 👤 客户端对比展示

---

## 🎯 架构设计

### 后端架构（Codex 规划）

#### 1. API 路由设计

| 路由 | 方法 | 用途 | 状态码 |
|------|------|------|--------|
| `/api/example/request/scenario` | POST | 统一场景模拟 | 200 |
| `/api/example/request/success` | GET | 成功响应 | 200 |
| `/api/example/request/error/400` | GET | Bad Request | 400 |
| `/api/example/request/error/401` | GET | Unauthorized | 401 |
| `/api/example/request/error/404` | GET | Not Found | 404 |
| `/api/example/request/error/500` | GET | Server Error | 500 |
| `/api/example/request/error/503` | GET | Service Unavailable | 503 |

**响应格式（统一 Envelope）**：
```typescript
// 成功
{ success: true, data: {...}, code: 200, message: "OK" }

// 业务错误（HTTP 200）
{ success: false, data: null, code: 10086, message: "业务逻辑错误", errorShowType: 2, requestId: "...", timestamp: "..." }

// HTTP 错误（4xx/5xx）
{ success: false, data: null, code: 10000, message: "错误信息", errorShowType: 2, requestId: "...", timestamp: "..." }
```

#### 2. Domain 层结构

```
domain/example/request/
├── const/
│   └── api.ts              # API 地址与默认 method
├── service.ts              # 请求逻辑（调用 httpServer/httpClient）
├── controller.ts           # 业务转换：success -> data；fail -> BusinessError
├── type.d.ts               # API response types
├── components/             # 示例 UI 组件
└── utils/                  # 领域内工具方法
```

**Service 方法**：
- `unifiedScenario(client, scenario, config?)`
- `success(client, config?)`
- `http400/401/404/500/503(client, config?)`

**Controller 方法**：
- `transformData(data, options?)`：成功 -> data，业务失败 -> BusinessError
- `rawScenario(client, scenario, config?)`：绕过 transform，返回原始数据

#### 3. 错误处理机制

- **传输层错误**（HTTP 4xx/5xx）：@kkfive/request 抛出 `RequestError`
- **业务错误**（HTTP 200 + success=false）：Controller 转换为 `BusinessError`
- **Server-side**：日志记录 + 页面显示
- **Client-side**：日志记录 + UI 友好提示

#### 4. 拦截器配置

**Server (`src/service/index.server.ts`)**：
- `beforeRequest`: Cookie 注入、Token 注入
- `afterResponse`: 请求日志、401/5xx 错误处理、性能监控

**Client (`src/service/index.client.ts`)**：
- `afterResponse`: 请求日志、HTTP 错误提示、JSON 响应结构校验

---

### 前端架构（Gemini 规划）

#### 1. 页面结构设计

**路由**: `/example/request-demo`

**文件结构**：
```
src/app/example/request-demo/
├── page.tsx                # [Server Component] 页面入口，服务端请求预取
├── layout.tsx              # [Server Component] 布局包装（可选）
└── components/             # 页面独有组件
    ├── request-section.tsx # [Client/Server] 分区容器
    ├── scenario-card.tsx   # [Client Component] 场景卡片（交互核心）
    ├── response-viewer.tsx # [Client Component] 响应结果展示器
    └── status-badge.tsx    # [Component] 状态徽章
```

**组件树**：
```
Page (Server)
├── Header Section
└── Main Content (Vertical Stack)
    ├── Section: Success Scenarios
    │   └── Row: Standard Request
    │       ├── Col: Server Side → ScenarioCard (Server Mode)
    │       └── Col: Client Side → ScenarioCard (Client Mode)
    ├── Section: Business Errors
    └── Section: HTTP Errors
```

#### 2. 核心组件设计

**ScenarioCard**（交互核心）：
```typescript
interface ScenarioCardProps {
  title: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  mode: 'server' | 'client';
  initialData?: any;                    // Server 模式初始数据
  requestAction?: () => Promise<any>;   // Client 模式请求函数
  expectedStatus: 'success' | 'business-error' | 'http-error';
}
```

**ResponseViewer**（结果展示）：
```typescript
interface ResponseViewerProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: any;
  statusCode?: number;
  latency?: number;
  isExpanded?: boolean;
}
```

**StatusBadge**（状态徽章）：
```typescript
interface StatusBadgeProps {
  type: 'server' | 'client';
  className?: string;
}
```

#### 3. 状态管理方案

**客户端状态**：
- 使用自定义 Hook：`useRequestDemo<T>(requestFn: () => Promise<T>)`
- State: `data`, `error`, `loading`, `latency`
- Action: `execute()`

**服务端数据**：
- 在 `page.tsx` 中使用 `Promise.all` 并行请求
- 错误处理：`try-catch` 包裹，确保页面不崩溃
- 刷新机制：Server Action 绑定 `Revalidate All` 按钮

#### 4. 样式系统（Tailwind CSS）

**颜色语义映射**：

| 场景 | 边框颜色 | 背景色 | 徽章颜色 |
|------|----------|--------|----------|
| Success | `border-green-500/50` | `bg-green-500/5` | `bg-green-100 text-green-700` |
| Business Error | `border-orange-500/50` | `bg-orange-500/5` | `bg-orange-100 text-orange-700` |
| HTTP Error | `border-red-500/50` | `bg-red-500/5` | `bg-red-100 text-red-700` |

**响应式策略**：
- 容器：`container mx-auto max-w-5xl py-8`
- Grid：`grid grid-cols-1 lg:grid-cols-2 gap-6`（移动端单列，桌面端双列）

#### 5. 交互设计细节

**Server Card**：
- 加载时：Skeleton 骨架屏
- 加载后：静态展示 JSON，高亮关键字段

**Client Card**：
- 初始状态：显示 Request Config，响应区显示 "Ready"
- 点击 "Send Request"：按钮 Loading Spinner，响应区半透明遮罩
- 请求结束：Loading 消失，边框闪烁对应颜色，Toast 弹出简要结果

**数据展示**：
- JSON 格式化：`<pre className="text-xs font-mono overflow-auto max-h-60">`
- 关键字段高亮：`code`, `msg`, `data`

---

## 🚀 实施步骤（优先级排序）

### Phase 1: 基础设施（Infrastructure）

**优先级**: 🔴 最高

1. **补齐 API 路由**
   - [ ] 创建 `/api/example/request/scenario` (POST)
   - [ ] 创建 `/api/example/request/error/404` (GET)
   - [ ] 创建 `/api/example/request/error/500` (GET)
   - [ ] 创建 `/api/example/request/error/503` (GET)
   - [ ] 验证现有路由：`success`, `400`, `401`

2. **扩展 Domain Service**
   - [ ] 在 `domain/example/request/service.ts` 添加方法：
     - `success(client, config?)`
     - `http404(client, config?)`
     - `http500(client, config?)`
     - `http503(client, config?)`

3. **扩展 Domain Controller**
   - [ ] 添加 `rawScenario` 方法（绕过 transformData）
   - [ ] 确保 `transformData` 正确处理所有场景

---

### Phase 2: 组件开发（Component Dev）

**优先级**: 🟠 高

4. **创建可复用 UI 组件**
   - [ ] `ResponseViewer` 组件
     - JSON 格式化展示
     - Loading 遮罩
     - 根据状态改变边框颜色
   - [ ] `StatusBadge` 组件
     - Server/Client 徽章
     - HTTP 状态码标签
   - [ ] `MethodBadge` 组件
     - HTTP 方法颜色编码（GET 蓝, POST 绿, DELETE 红）

5. **开发 ScenarioCard 组件**
   - [ ] Server 模式：静态数据展示
   - [ ] Client 模式：交互按钮 + 请求逻辑
   - [ ] 集成 `useRequestDemo` Hook
   - [ ] 状态着色逻辑

---

### Phase 3: 页面组装（Assembly）

**优先级**: 🟡 中

6. **创建展示页面**
   - [ ] 创建 `/example/request-demo/page.tsx`
   - [ ] 服务端数据预取（`Promise.all`）
   - [ ] 错误边界处理

7. **布局整合**
   - [ ] 垂直分段布局：
     - Section 1: 成功请求
     - Section 2: 业务错误
     - Section 3: HTTP 错误
   - [ ] Grid 双列对比（Server vs Client）
   - [ ] 响应式适配（移动端单列）

8. **添加交互功能**
   - [ ] "Revalidate All" 按钮（Server Action）
   - [ ] Toast 提示集成
   - [ ] Loading 状态管理

---

### Phase 4: 优化与测试（Polish & Test）

**优先级**: 🟢 低

9. **样式微调**
   - [ ] Tailwind 颜色调整
   - [ ] Dark Mode 适配（如果有）
   - [ ] 动画效果（边框闪烁、Toast 弹出）

10. **添加 Loading 优化**
    - [ ] 为 Server Component 添加 `loading.tsx` 骨架屏
    - [ ] Suspense 边界优化

11. **补充测试**
    - [ ] Controller 单元测试
      - success -> data
      - business-error -> BusinessError
      - RequestError passthrough
    - [ ] Service 单元测试
      - 场景参数传递正确
    - [ ] API 路由测试（MSW）
      - 验证 status code 与 response body
    - [ ] UI 示例验证
      - Server/Client 页面渲染
      - 错误对象类型捕获

12. **验证拦截器效果**
    - [ ] Cookie/Token 注入验证
    - [ ] 业务错误转换验证
    - [ ] HTTP error 捕获验证

---

## 📊 技术风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `localhost:3000` 硬编码 | 生产环境失败 | 使用环境变量或相对路径 |
| 拦截器绕过机制不明确 | 无法展示原始数据 | 确认 @kkfive/request 文档，或通过 Controller 层绕过 |
| Server/Client 混用 | 运行时错误 | 严格区分组件类型，添加类型检查 |
| 缺失 API 路由 | 运行时失败 | Phase 1 优先补齐所有路由 |

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有 7 个 API 路由正常工作
- [ ] 成功请求展示（拦截器 + 原始数据）
- [ ] 业务错误展示（HTTP 200 but code ≠ 200）
- [ ] HTTP 错误展示（400, 401, 404, 500, 503）
- [ ] 服务端和客户端对比展示

### UI/UX 质量
- [ ] 颜色编码清晰（绿/橙/红）
- [ ] 响应式布局正常（移动端/桌面端）
- [ ] Loading 状态流畅
- [ ] Toast 提示及时
- [ ] JSON 数据格式化美观

### 代码质量
- [ ] 所有测试通过
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 警告
- [ ] 代码符合项目规范

---

## 📝 后续扩展建议

1. **文档化**：为每个场景添加代码注释和使用说明
2. **性能监控**：添加请求耗时统计和可视化
3. **错误重试**：为客户端请求添加重试机制
4. **导出功能**：允许导出请求/响应数据为 JSON
5. **主题切换**：支持 Light/Dark Mode 切换

---

**规划完成日期**: 2026-01-21
**预计实施周期**: 2-3 天
**负责人**: Claude (编排) + Codex (后端) + Gemini (前端)
