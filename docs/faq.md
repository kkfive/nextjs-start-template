# 常见问题 (FAQ)

## 一、HTTP 请求与网络层

### 1. 如何自定义 HttpService 以适配后端特定的响应信封结构？

本项目默认响应格式定义在 `src/lib/request/type.ts`：

```typescript
// 成功响应
interface HttpResponseSuccess<T> {
  data: T
  success: true
  code?: number
  message?: string
}

// 错误响应
interface HttpResponseError<T> {
  code: number
  data: T
  success: false
  message: string
  errorShowType: ERROR_SHOW_TYPE
  requestId: string
  timestamp: string
}
```

**适配不同格式的方法**：

1. **修改类型定义**：编辑 `src/lib/request/type.ts` 中的 `HttpResponseSuccess` 和 `HttpResponseError`
2. **修改转换逻辑**：在 Controller 的 `transformData` 函数中调整判断逻辑

```typescript
// domain/example/request/controller.ts 示例
function transformData<T>(data: YourResponseType<T>, options?: RequestOptions) {
  // 根据你的后端格式调整判断条件
  if (data.code === 200) {  // 或 data.success === true
    return data.data
  }
  throw new BusinessError(data.message, { code: data.code, response: data, options })
}
```

---

### 2. `src/service/` 下的 `.base.ts`、`.client.ts`、`.server.ts` 应引入哪一个？

| 文件 | 使用场景 | 环境变量 |
|------|----------|----------|
| `index.base.ts` | 通用场景（无特殊配置） | 无 |
| `index.client.ts` | 客户端组件 (`'use client'`) | `NEXT_PUBLIC_API_URL` |
| `index.server.ts` | 服务端组件 (RSC)、API 路由 | `API_BASE_URL` |

**选择原则**：

```typescript
// 客户端组件
'use client'
import { httpClient } from '@/service/index.client'

// 服务端组件 / API 路由
import { httpServer } from '@/service/index.server'

// 通用场景（如 domain 层测试）
import { http } from '@/service/index.base'
```

**关键区别**：
- `index.server.ts`：包含 Cookie 注入、Token 注入等服务端专用拦截器
- `index.client.ts`：包含客户端日志、错误提示等客户端专用拦截器
- `index.base.ts`：无拦截器，适合测试或简单场景

---

### 3. 如何在 HttpService 中注册全局拦截器？

在 `src/service/index.client.ts` 或 `index.server.ts` 中配置 `hooks`：

```typescript
const http = new HttpService({
  prefixUrl: getBaseUrl(),
  hooks: {
    // 请求前拦截器
    beforeRequest: [
      async (request) => {
        // Token 注入
        const token = getToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    // 响应后拦截器
    afterResponse: [
      async (input, options, response) => {
        // 401 跳转登录
        if (response.status === 401) {
          window.location.href = '/login'
        }
        return response
      },
    ],
  },
})
```

参考实现：`src/service/index.server.ts:16-45`（Token 注入示例）

---

### 4. BusinessError 应该在组件层局部处理还是有全局错误边界？

**推荐方案**：两者结合

1. **全局处理**：已在 `src/components/providers.tsx` 中配置 QueryCache 和 MutationCache 的全局错误处理

```typescript
// src/components/providers.tsx
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 检查是否跳过全局错误处理
      if (query.meta?.skipGlobalErrorHandler) return

      if (error instanceof BusinessError) {
        console.error(`[业务错误] ${error.message}`, { code: error.code })
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalErrorHandler) return
      // 处理错误...
    },
  }),
})
```

2. **跳过全局处理**：在 `useQuery`/`useMutation` 的 `meta` 中设置 `skipGlobalErrorHandler: true`

```typescript
// 需要局部处理的场景，跳过全局错误处理
const { data, error } = useQuery({
  queryKey: ['data'],
  queryFn: () => Controller.getData(http),
  meta: { skipGlobalErrorHandler: true },  // 跳过全局错误处理
})

// 组件内局部处理
if (error instanceof BusinessError) {
  // 根据 error.code 显示特定提示
}
```

3. **类型支持**：`skipGlobalErrorHandler` 已在 `typings/global.d.ts` 中声明类型

---

## 二、数据类型与泛型定义

### 5. 分页接口的通用 `PaginatedResponse<T>` 泛型应定义在哪里？

**位置**：`domain/_shared/types/index.ts`

本项目已提供分页类型定义：

```typescript
// domain/_shared/types/index.ts
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}
```

**使用方式**：

```typescript
// domain/user/type.d.ts
import type { PaginatedResponse } from '@domain/_shared/types'

declare namespace User {
  type ListResponse = PaginatedResponse<User>
}
```

---

### 6. 后端接口类型定义应存放在 `domain/[module]/type.d.ts` 还是 `typings/`？

| 位置 | 用途 | 示例 |
|------|------|------|
| `domain/[module]/type.d.ts` | 模块专属类型（API 响应、业务实体） | `Hitokoto.Hitokoto` |
| `domain/_shared/types/` | 跨模块共享类型（分页、通用工具类型） | `PaginatedResponse<T>` |
| `typings/global.d.ts` | 全局类型扩展（Window、第三方库） | `Window.gtag` |

**推荐做法**：

```typescript
// domain/user/type.d.ts - 模块专属
declare namespace User {
  interface User {
    id: string
    name: string
  }
  interface ListAPI {
    Response: PaginatedResponse<User>
  }
}
```

---

### 7. 后端返回 `snake_case` 而前端用 `camelCase` 时如何处理？

**推荐方案**：在 Controller 层使用 `es-toolkit` 转换

```typescript
// domain/user/controller.ts
import { toCamelCaseKeys } from 'es-toolkit/object'

export class Controller {
  static async getUser(client: HttpService) {
    const response = await service.getUser(client)
    const data = await response.json()
    // 递归转换所有键为 camelCase
    return toCamelCaseKeys(data.data)
  }
}
```

**示例**：

```typescript
import { toCamelCaseKeys } from 'es-toolkit/object'

const apiResponse = {
  user_id: 1,
  first_name: 'John',
  contact_info: {
    email_address: 'john@example.com',
    phone_number: '123-456-7890',
  },
}

const result = toCamelCaseKeys(apiResponse)
// result: {
//   userId: 1,
//   firstName: 'John',
//   contactInfo: {
//     emailAddress: 'john@example.com',
//     phoneNumber: '123-456-7890',
//   },
// }
```

**不推荐**：在 HttpService 层全局转换（可能影响某些不需要转换的接口）

---

## 三、架构设计与分层边界

### 8. `domain/` 与 `components/domain/` 的职责如何划分？

| 层级 | 职责 | 内容 | 限制 |
|------|------|------|------|
| `domain/` | 纯业务逻辑 | Controller、Service、Type、Schema | **禁止 React/JSX** |
| `components/domain/` | 业务 UI | 结合业务逻辑的 React 组件 | 可导入 `@domain/*` |

**判断标准**：
- 能否在 Node.js 环境运行？→ `domain/`
- 需要 React 渲染？→ `components/domain/`

```
domain/example/hitokoto/
├── controller.ts    # 业务逻辑：调用 service、数据转换
├── service.ts       # API 调用：纯 HTTP 请求
└── type.d.ts        # 类型定义

src/components/domain/hitokoto/
└── hitokoto-card.tsx  # UI 组件：使用 Controller + useQuery + UI 组件
```

---

### 9. 为什么采用 `Controller.getData(http, ...)` 显式注入模式？

**优势**：

1. **可测试性**：测试时可注入 Mock 的 http 实例，无需 Mock 模块

```typescript
// 测试中
const mockHttp = new HttpService()
const result = await Controller.getData(mockHttp)
```

2. **灵活性**：同一 Controller 可用于客户端和服务端

```typescript
// 客户端
Controller.getData(httpClient)

// 服务端
Controller.getData(httpServer)
```

3. **解耦**：domain 层不依赖具体的 http 实例，保持框架无关

---

### 10. React Query 与 Zustand Store 的职责如何划分？

| 工具 | 职责 | 示例 |
|------|------|------|
| **React Query** | 服务端状态（API 数据） | 用户列表、文章详情 |
| **Zustand** | 客户端状态（UI 状态） | Sidebar 开关、主题切换 |

**判断标准**：
- 数据来自 API？→ React Query
- 数据仅存在于前端？→ Zustand

```typescript
// React Query - 服务端状态
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: () => Controller.getUsers(http),
})

// Zustand - 客户端状态
const { sidebarOpen, toggleSidebar } = useSidebarStore()
```

---

### 11. 前端 Controller 与后端 MVC Controller 的区别？

| 方面 | 前端 Controller | 后端 MVC Controller |
|------|-----------------|---------------------|
| **职责** | 业务逻辑编排、数据转换 | 路由处理、请求响应 |
| **调用方** | UI 组件 | HTTP 框架 |
| **依赖注入** | http 实例 | 数据库、服务 |

**前端 Controller 主要职责**：
1. 调用 Service 获取数据
2. 数据格式转换（snake_case → camelCase）
3. 错误处理（抛出 BusinessError）
4. 组合多个 Service 调用

```typescript
// domain/example/request/controller.ts
export class Controller {
  static async unifiedScenario(client: HttpService, scenario: string) {
    const response = await service.unifiedScenario(client, scenario)
    const result = await response.json()
    return transformData(result)  // 数据转换 + 错误处理
  }
}
```

---

## 四、开发体验与测试调试

### 12. 如何 Mock 通过参数注入的 http 实例？

**方案一**：使用 MSW（推荐）

```typescript
// domain/example/request/controller.test.ts
import { server } from '@/__tests__/mocks/server'
import { HttpService } from '@/lib/request'

describe('Controller', () => {
  let httpClient: HttpService

  beforeAll(() => {
    server.listen()
    httpClient = new HttpService()
  })

  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('should return data', async () => {
    const result = await Controller.getData(httpClient)
    expect(result).toBeDefined()
  })
})
```

**方案二**：直接 Mock HttpService

```typescript
const mockHttp = {
  get: vi.fn().mockResolvedValue({ json: () => ({ success: true, data: {} }) }),
} as unknown as HttpService

const result = await Controller.getData(mockHttp)
```

---

### 13. 环境变量配置差异？

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `.env` | 默认值（所有环境） | 最低 |
| `.env.local` | 本地开发（不提交 Git） | 高 |
| `.env.development` | 开发环境 | 中 |
| `.env.production` | 生产环境 | 中 |

**关键变量**：

```bash
# 服务端专用（不暴露给浏览器）
API_BASE_URL=https://api.example.com

# 客户端可用（必须 NEXT_PUBLIC_ 前缀）
NEXT_PUBLIC_API_URL=https://api.example.com
```

**类型安全**：本项目使用 `@t3-oss/env-nextjs` 进行环境变量验证，配置在 `src/config/env.ts`

---

### 14. RSC 数据获取失败时如何调试？

1. **查看服务端日志**：`src/service/index.server.ts` 中的拦截器会输出请求日志

```
[Server Request] 2026-01-21T10:00:00Z GET https://api.example.com/data
[Server Response] 2026-01-21T10:00:01Z GET https://api.example.com/data - 500 Internal Server Error
```

2. **检查环境变量**：确保 `API_BASE_URL` 正确配置

3. **使用 Error Boundary**：在 `app/` 目录添加 `error.tsx`

```typescript
// src/app/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('RSC Error:', error)
  return <button onClick={reset}>重试</button>
}
```

4. **开启调试模式**：设置 `NEXT_PUBLIC_DEBUG=true`

---

## 五、UI 与样式

### 15. 如何在项目中使用图标？

本项目使用 **Iconify + Tailwind CSS** 方案，禁止直接安装 `lucide-react` 等图标库。

**使用方式**：

```typescript
// 从统一入口导入
import { LucideHome, LucideArrowRight } from '@/components/ui/icon'

// 在 JSX 中使用
<LucideHome className="size-5 text-blue-500" />
```

**添加新图标**：

```typescript
// src/components/ui/icon/index.ts
import { CreateIcon } from './create-icon'

// 命名规则：{图标集}{图标名} (PascalCase)
export const LucideSearch = CreateIcon('icon-[lucide--search]')
```

**图标查询**：[Iconify 图标库](https://icon-sets.iconify.design/)

详见 `docs/conventions/coding.md` 图标使用章节。
