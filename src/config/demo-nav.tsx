import type { ReactNode } from 'react'
import {
  LucideDatabase,
  LucideFileText,
  LucidePalette,
  LucideStore,
} from '@/components/ui/icon'

/**
 * Demo 导航项配置接口
 */
export type DemoNavItem = {
  /** 示例名称 */
  name: string
  /** 示例路由路径 */
  href: string
  /** 示例描述 */
  description: string
}

/**
 * Demo 导航分类
 */
export type DemoNavCategory = {
  /** 分类名称 */
  category: string
  /** 分类图标 */
  icon: ReactNode
  /** 该分类下的示例列表 */
  items: DemoNavItem[]
}

/**
 * Demo 导航配置
 * 单一数据源，用于生成侧边栏导航树
 *
 * 注意：这是 Demo 专用配置，核心代码不应导入此文件
 */
export const demoNavConfig: DemoNavCategory[] = [
  {
    category: 'UI',
    icon: <LucidePalette className="size-5" />,
    items: [
      {
        name: 'Color Palette',
        href: '/demo/ui/color-palette',
        description: 'Tailwind CSS color system demonstration',
      },
    ],
  },
  {
    category: 'Forms',
    icon: <LucideFileText className="size-5" />,
    items: [
      {
        name: 'Form Validation',
        href: '/demo/forms/form-validation',
        description: 'react-hook-form + zod validation',
      },
    ],
  },
  {
    category: 'Data Fetching',
    icon: <LucideDatabase className="size-5" />,
    items: [
      {
        name: '基础请求方法',
        href: '/demo/request/basic',
        description: 'GET/POST/PUT/DELETE/PATCH 方法演示',
      },
      {
        name: '请求配置参数',
        href: '/demo/request/config',
        description: 'retry/timeout 配置参数影响演示',
      },
      {
        name: '拦截器机制',
        href: '/demo/request/interceptor',
        description: 'beforeRequest/afterResponse 完整流程',
      },
      {
        name: '错误处理',
        href: '/demo/request/errors',
        description: 'HTTP 错误、业务错误、错误数据获取',
      },
      {
        name: '401 认证处理',
        href: '/demo/request/auth',
        description: '自动跳转 vs skipAuthRedirect 禁用跳转',
      },
      {
        name: 'SSE 流式请求',
        href: '/demo/request/sse',
        description: 'async iteration / emitter 两种流消费模式',
      },
      {
        name: 'Hitokoto API',
        href: '/demo/request/hitokoto',
        description: 'External API request with ky',
      },
    ],
  },
  {
    category: 'State Management',
    icon: <LucideStore className="size-5" />,
    items: [
      {
        name: 'Zustand Store',
        href: '/demo/state/zustand-mouse',
        description: 'Global state with Zustand',
      },
    ],
  },
]
