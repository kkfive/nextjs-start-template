# 完整示例

## Auth 模块示例

### const/api.ts

```typescript
export const AUTH_API = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
} as const

export const AUTH_QUERY_KEYS = {
  all: () => ['auth'] as const,
  me: () => [...AUTH_QUERY_KEYS.all(), 'me'] as const,
} as const
```

### type.d.ts

```typescript
declare namespace Auth {
  // 响应类型
  type LoginResponse = {
    token: string
    user: { id: string, username: string, email: string }
  }

  type RegisterResponse = {
    token: string
    user: { id: string, username: string, email: string }
  }

  type UserInfo = {
    id: string
    username: string
    email: string
    avatar?: string
  }

  type MessageResponse = {
    success: boolean
    message: string
  }

  // 请求类型
  type LoginRequest = { username: string, password: string }
  type RegisterRequest = { username: string, email: string, password: string, confirmPassword: string }
  type ForgotPasswordRequest = { email: string }
  type ResetPasswordRequest = { token: string, password: string, confirmPassword: string }
}
```

### service.ts

```typescript
import type { HttpService } from '@/lib/request'
import { AUTH_API } from './const/api'

export const authService = {
  login: async (http: HttpService, data: Auth.LoginRequest): Promise<Auth.LoginResponse> => {
    return http.post(AUTH_API.LOGIN, { json: data })
  },

  register: async (http: HttpService, data: Auth.RegisterRequest): Promise<Auth.RegisterResponse> => {
    return http.post(AUTH_API.REGISTER, { json: data })
  },

  logout: async (http: HttpService): Promise<void> => {
    return http.post(AUTH_API.LOGOUT)
  },

  getMe: async (http: HttpService): Promise<Auth.UserInfo> => {
    return http.get(AUTH_API.ME)
  },

  forgotPassword: async (http: HttpService, data: Auth.ForgotPasswordRequest): Promise<Auth.MessageResponse> => {
    return http.post(AUTH_API.FORGOT_PASSWORD, { json: data })
  },

  resetPassword: async (http: HttpService, data: Auth.ResetPasswordRequest): Promise<Auth.MessageResponse> => {
    return http.post(AUTH_API.RESET_PASSWORD, { json: data })
  },
}
```

### controller.ts

```typescript
import type { HttpService } from '@/lib/request'
import { authService } from './service'

export const authController = {
  login: async (http: HttpService, data: Auth.LoginRequest): Promise<Auth.LoginResponse> => {
    return authService.login(http, data)
  },

  register: async (http: HttpService, data: Auth.RegisterRequest): Promise<Auth.RegisterResponse> => {
    return authService.register(http, data)
  },

  logout: async (http: HttpService): Promise<void> => {
    return authService.logout(http)
  },

  getMe: async (http: HttpService): Promise<Auth.UserInfo> => {
    return authService.getMe(http)
  },

  forgotPassword: async (http: HttpService, data: Auth.ForgotPasswordRequest): Promise<Auth.MessageResponse> => {
    return authService.forgotPassword(http, data)
  },

  resetPassword: async (http: HttpService, data: Auth.ResetPasswordRequest): Promise<Auth.MessageResponse> => {
    return authService.resetPassword(http, data)
  },

  // 业务编排
  loginAndGetUser: async (http: HttpService, data: Auth.LoginRequest) => {
    const auth = await authController.login(http, data)
    const user = await authController.getMe(http)
    return { auth, user }
  },
}
```

### hooks.ts

```typescript
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/service/index.client'
import { toast } from '@/components/ui/sonner'
import { authController } from './controller'
import { AUTH_QUERY_KEYS } from './const/api'

export function useMe(options?: Omit<UseQueryOptions<Auth.UserInfo>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: () => authController.getMe(httpClient),
    ...options,
  })
}

export function useLogin(options?: Omit<UseMutationOptions<Auth.LoginResponse, Error, Auth.LoginRequest>, 'mutationFn'>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Auth.LoginRequest) => authController.login(httpClient, data),
    onSuccess: (data, variables, context) => {
      toast.success('登录成功')
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me() })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '登录失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

export function useRegister(options?: Omit<UseMutationOptions<Auth.RegisterResponse, Error, Auth.RegisterRequest>, 'mutationFn'>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Auth.RegisterRequest) => authController.register(httpClient, data),
    onSuccess: (data, variables, context) => {
      toast.success('注册成功')
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me() })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '注册失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

export function useLogout(options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authController.logout(httpClient),
    onSuccess: (data, variables, context) => {
      toast.success('登出成功')
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.all() })
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(error.message || '登出失败')
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}
```

### index.ts

```typescript
// ⚠️ 注意：type.d.ts 使用 declare namespace，是全局声明，不需要导出
// 直接使用 Auth.xxx 即可，无需 import

export { AUTH_API, AUTH_QUERY_KEYS } from './const/api'
export { authService } from './service'
export { authController } from './controller'
export { useMe, useLogin, useRegister, useLogout, useForgotPassword, useResetPassword } from './hooks'
export { loginSchema, registerSchema, forgotPasswordSchema } from './schema'
```

## 组件使用示例

### Client Component（使用 Hooks）

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useLogin } from '@domain/auth'
import { Button, Form, Input } from 'antd'

export default function LoginPage() {
  const router = useRouter()
  const [form] = Form.useForm<Auth.LoginRequest>()

  const loginMutation = useLogin({
    onSuccess: () => router.push('/dashboard'),
  })

  return (
    <Form form={form} onFinish={(values) => loginMutation.mutate(values)}>
      <Form.Item name="username" rules={[{ required: true }]}>
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true }]}>
        <Input.Password placeholder="密码" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loginMutation.isPending}>
        登录
      </Button>
    </Form>
  )
}
```

### Server Component（直接调用 Controller）

```typescript
import { httpServer } from '@/service/index.server'
import { authController } from '@/domain/auth'

export default async function DashboardPage() {
  const user = await authController.getMe(httpServer)

  return (
    <div>
      <h1>欢迎，{user.username}</h1>
    </div>
  )
}
```
