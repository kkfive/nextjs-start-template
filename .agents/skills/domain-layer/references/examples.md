# 完整示例

## Auth 模块示例

### const/api.ts

```typescript
export const AUTH_API = {
  LOGIN: '/api/auth/login',
  ME: '/api/auth/me',
  LOGOUT: '/api/auth/logout',
} as const

export const AUTH_QUERY_KEYS = {
  all: () => ['auth'] as const,
  me: () => [...AUTH_QUERY_KEYS.all(), 'me'] as const,
} as const
```

### type.ts

```typescript
export type LoginResponse = {
  token: string
  user: UserInfo
}

export type UserInfo = {
  id: string
  username: string
  email: string
  avatar?: string
}

export type LoginRequest = {
  username: string
  password: string
}
```

### service.ts

```typescript
// packages/domain-core/src/auth/service.ts
import type { LoginRequest, LoginResponse, UserInfo } from './type'
import type { HttpService } from '@kkfive/http-client'
import { AUTH_API } from './const/api'

export const authService = {
  login: async (http: HttpService, data: LoginRequest): Promise<LoginResponse> => {
    return http.post(AUTH_API.LOGIN, data)
  },

  getMe: async (http: HttpService): Promise<UserInfo> => {
    return http.get(AUTH_API.ME)
  },

  logout: async (http: HttpService): Promise<void> => {
    return http.post(AUTH_API.LOGOUT)
  },
}
```

### controller.ts

```typescript
// packages/domain-core/src/auth/controller.ts
import type { LoginRequest, LoginResponse, UserInfo } from './type'
import type { HttpService } from '@kkfive/http-client'
import { authService } from './service'

export const authController = {
  login: async (http: HttpService, data: LoginRequest): Promise<LoginResponse> => {
    return authService.login(http, data)
  },

  getMe: async (http: HttpService): Promise<UserInfo> => {
    return authService.getMe(http)
  },

  loginAndGetUser: async (http: HttpService, data: LoginRequest) => {
    const auth = await authController.login(http, data)
    const user = await authController.getMe(http)
    return { auth, user }
  },
}
```

### hooks.ts

> 此文件位于各 Next.js app 的 Domain 适配层（`apps/client/domain/auth/hooks.ts`），不在共享包。

```typescript
// apps/client/domain/auth/hooks.ts
import type { LoginRequest, LoginResponse, UserInfo } from '@kkfive/domain-core/auth'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { toast } from '@/components/ui/sonner'
import { AUTH_QUERY_KEYS, authController } from '@kkfive/domain-core/auth'

export function useMe(options?: Omit<UseQueryOptions<UserInfo>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: () => authController.getMe(httpClient),
    ...options,
  })
}

export function useLogin(options?: Omit<UseMutationOptions<LoginResponse, Error, LoginRequest>, 'mutationFn'>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => authController.login(httpClient, data),
    onSuccess: (data, variables, context) => {
      toast.success('登录成功')
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
```

### index.ts（共享包）

```typescript
// packages/domain-core/src/auth/index.ts
export { AUTH_API, AUTH_QUERY_KEYS } from './const/api'
export { authService } from './service'
export { authController } from './controller'
export type * from './type'
```

### index.ts（适配层，apps/client）

```typescript
// apps/client/domain/auth/index.ts
export * from '@kkfive/domain-core/auth'           // re-export 共享包
export { useLogin, useMe } from './hooks'          // app 专属 hooks
```
