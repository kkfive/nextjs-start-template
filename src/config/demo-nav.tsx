import type { ReactNode } from 'react'
import { Database, FileText, Palette, Store } from 'lucide-react'

/**
 * Demo 导航项配置接口
 */
export interface DemoNavItem {
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
export interface DemoNavCategory {
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
    icon: <Palette className="size-5" />,
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
    icon: <FileText className="size-5" />,
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
    icon: <Database className="size-5" />,
    items: [
      {
        name: 'HTTP Request - Interceptor',
        href: '/demo/request/interceptor',
        description: 'Request interceptor transforms response envelope',
      },
      {
        name: 'HTTP Request - Raw Envelope',
        href: '/demo/request/raw-envelope',
        description: 'Raw response envelope without interceptor',
      },
      {
        name: 'HTTP Request - Error Handling',
        href: '/demo/request/http-errors',
        description: 'HTTP error status codes (404, 500, 503)',
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
    icon: <Store className="size-5" />,
    items: [
      {
        name: 'Zustand Store',
        href: '/demo/state/zustand-mouse',
        description: 'Global state with Zustand',
      },
    ],
  },
]
