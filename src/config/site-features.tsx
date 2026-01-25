import type { ReactNode } from 'react'
import { AlertTriangle, Database, FileText, Palette, Store } from 'lucide-react'

/**
 * 功能卡片配置接口
 * 定义单个功能示例的完整信息
 */
export interface FeatureCardConfig {
  /** 示例名称 */
  name: string
  /** 示例路由路径 */
  href: string
  /** 示例描述 */
  description: string
  /**
   * 优先级（1-5）
   * 5: 最高优先级（核心功能）
   * 4: 高优先级（重要功能）
   * 3: 中等优先级（常用功能）
   * 2: 低优先级（辅助功能）
   * 1: 最低优先级（次要功能）
   */
  priority: 1 | 2 | 3 | 4 | 5
}

/**
 * 功能分类
 */
export interface FeatureCategory {
  /** 分类名称 */
  category: string
  /** 分类图标（仅用于首页展示） */
  icon?: ReactNode
  /** 该分类下的功能示例列表 */
  items: FeatureCardConfig[]
}

/**
 * 分类图标映射
 * 为每个分类提供对应的 Lucide 图标
 */
export const categoryIcons: Record<string, ReactNode> = {
  'UI': <Palette className="size-6" />,
  'Forms': <FileText className="size-6" />,
  'Data Fetching': <Database className="size-6" />,
  'Error Handling': <AlertTriangle className="size-6" />,
  'State Management': <Store className="size-6" />,
}

/**
 * 站点功能配置
 * 集中管理所有功能示例的数据，供首页和示例列表页共享使用
 *
 * 数据统计：
 * - 总功能数：6 个
 * - 分类数：4 个（UI, Forms, Data Fetching, State Management）
 * - 优先级分布：P5(1), P4(2), P3(3)
 */
export const siteFeatures: FeatureCategory[] = [
  {
    category: 'UI',
    icon: categoryIcons.UI,
    items: [
      {
        name: 'Color Palette',
        href: '/example/color',
        description: 'Tailwind CSS color system demonstration',
        priority: 3,
      },
    ],
  },
  {
    category: 'Forms',
    icon: categoryIcons.Forms,
    items: [
      {
        name: 'Form Validation',
        href: '/example/form',
        description: 'react-hook-form + zod validation',
        priority: 4,
      },
    ],
  },
  {
    category: 'Data Fetching',
    icon: categoryIcons['Data Fetching'],
    items: [
      {
        name: 'HTTP Request Examples',
        href: '/example/request-demo',
        description: 'Unified request handling with interceptors (success, business errors, HTTP errors)',
        priority: 5,
      },
      {
        name: 'Hitokoto API',
        href: '/example/request/hitokoto',
        description: 'External API request with ky',
        priority: 4,
      },
    ],
  },
  {
    category: 'State Management',
    icon: categoryIcons['State Management'],
    items: [
      {
        name: 'Zustand Store',
        href: '/example/zustand',
        description: 'Global state with Zustand',
        priority: 3,
      },
    ],
  },
]
