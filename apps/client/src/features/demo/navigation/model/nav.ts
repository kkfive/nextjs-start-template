import type { ReactNode } from 'react'
import {
  LucideDatabase,
  LucideFileText,
  LucideGitBranch,
  LucidePalette,
  LucideStore,
} from '@kkfive/ui/components/icon'
import { createElement } from 'react'

export type DemoNavItem = {
  id: string
  name: string
  href: string
  description: string
  aliases: string[]
  order?: number
}

export type DemoNavCategory = {
  id: string
  name: string
  /** @deprecated 兼容现有展示层；新逻辑使用稳定 id 与 name。 */
  category: string
  icon: ReactNode
  items: DemoNavItem[]
  order?: number
}

export const demoNavConfig: DemoNavCategory[] = [
  {
    id: 'ui',
    name: 'UI',
    category: 'UI',
    icon: createElement(LucidePalette, { className: 'size-5' }),
    order: 10,
    items: [
      { id: 'color-palette', name: '色彩系统', href: '/demo/ui/color-palette', description: 'Tailwind CSS 4 色板与语义 token 展示', aliases: ['theme', 'palette', '颜色'], order: 10 },
      { id: 'adaptive-footer', name: 'Adaptive Footer', href: '/demo/ui/adaptive-footer', description: '结构化 Footer 与 auto-fit 网格自适应展示', aliases: ['footer', 'grid', '布局'], order: 15 },
      { id: 'pdf-viewer', name: 'PDF 预览', href: '/demo/pdf-viewer', description: '@kkfive/ui/widgets PDF 预览组件（worker 宿主注入）', aliases: ['document', '文档'], order: 20 },
    ],
  },
  {
    id: 'forms',
    name: 'Forms',
    category: 'Forms',
    icon: createElement(LucideFileText, { className: 'size-5' }),
    order: 20,
    items: [
      { id: 'form-validation', name: '表单校验', href: '/demo/forms/form-validation', description: 'react-hook-form + Zod 校验流程演示', aliases: ['zod', 'validation'], order: 10 },
    ],
  },
  {
    id: 'data-fetching',
    name: 'Data Fetching',
    category: 'Data Fetching',
    icon: createElement(LucideDatabase, { className: 'size-5' }),
    order: 30,
    items: [
      { id: 'request-basic', name: '基础请求方法', href: '/demo/request/basic', description: 'GET / POST / PUT / DELETE / PATCH 方法演示', aliases: ['http', 'ky'], order: 10 },
      { id: 'request-config', name: '请求配置参数', href: '/demo/request/config', description: 'retry / timeout 配置参数影响演示', aliases: ['retry', 'timeout'], order: 20 },
      { id: 'request-interceptor', name: '拦截器机制', href: '/demo/request/interceptor', description: 'beforeRequest / afterResponse 完整流程', aliases: ['hook', 'middleware'], order: 30 },
      { id: 'request-errors', name: '错误处理', href: '/demo/request/errors', description: 'HTTP 错误、业务错误、错误数据获取', aliases: ['error', 'exception'], order: 40 },
      { id: 'request-auth', name: '401 认证处理', href: '/demo/request/auth', description: '自动跳转与 skipAuthRedirect 禁用跳转对比', aliases: ['auth', '401'], order: 50 },
      { id: 'request-sse', name: 'SSE 流式请求', href: '/demo/request/sse', description: 'async iteration / emitter 两种流消费模式', aliases: ['stream', 'eventsource'], order: 60 },
      { id: 'request-hitokoto', name: 'Hitokoto API', href: '/demo/request/hitokoto', description: 'ky 外部 API 请求演示', aliases: ['一言', 'quote'], order: 70 },
    ],
  },
  {
    id: 'rpc',
    name: 'RPC',
    category: 'RPC',
    icon: createElement(LucideGitBranch, { className: 'size-5' }),
    order: 40,
    items: [{ id: 'hono-rpc', name: 'Hono RPC', href: '/demo/rpc', description: 'hc<AppType> → apps/api Hono RPC 类型化调用', aliases: ['hono', 'hc'], order: 10 }],
  },
  {
    id: 'state',
    name: 'State Management',
    category: 'State Management',
    icon: createElement(LucideStore, { className: 'size-5' }),
    order: 50,
    items: [{ id: 'zustand-mouse', name: 'Zustand Store', href: '/demo/state/zustand-mouse', description: 'Zustand 全局状态管理演示', aliases: ['state', 'mouse'], order: 10 }],
  },
]
