import type { DemoNavCategory } from './nav'
import { describe, expect, it } from 'vitest'
import {
  addRecentDemo,
  filterDemoNavigation,
  getActiveDemoCategory,
  hasMoreNavigationItems,
  NAVIGATION_ITEM_PAGE_SIZE,
  takeNavigationPage,
} from './navigation-state'

const navigation: DemoNavCategory[] = [
  {
    id: 'ui',
    name: 'UI Components',
    category: 'UI Components',
    icon: null,
    items: [
      { id: 'footer', name: 'Adaptive Footer', href: '/demo/ui/footer', description: 'Grid layout', aliases: ['页脚'] },
    ],
  },
  {
    id: 'request',
    name: 'Requests',
    category: 'Requests',
    icon: null,
    items: [
      { id: 'sse', name: 'SSE', href: '/demo/request/sse', description: 'Streaming events', aliases: ['流'] },
    ],
  },
]

describe('navigation state', () => {
  it('按子路由推导当前分类', () => {
    expect(getActiveDemoCategory(navigation, '/demo/request/sse/detail')).toBe('request')
  })

  it.each(['UI Components', 'Adaptive', 'Grid', '页脚'])(
    '按分类、名称、描述或 alias 搜索：%s',
    (query) => {
      expect(filterDemoNavigation(navigation, query, 'all', [])[0]?.items[0]?.id).toBe('footer')
    },
  )

  it('最近访问去重、置顶并限制功能容量', () => {
    expect(addRecentDemo(['b', 'a', 'c'], 'a', 3)).toEqual(['a', 'b', 'c'])
    expect(addRecentDemo(['b', 'c', 'd'], 'a', 3)).toEqual(['a', 'b', 'c'])
  })

  it('最近筛选保留匹配上下文', () => {
    const result = filterDemoNavigation(navigation, '', 'recent', ['sse'])
    expect(result).toHaveLength(1)
    expect(result[0]?.name).toBe('Requests')
  })

  it('为超大导航按批次限制首屏 DOM 数量', () => {
    const items = Array.from({ length: 1000 }, (_, index) => index)
    expect(takeNavigationPage(items, 1, NAVIGATION_ITEM_PAGE_SIZE)).toHaveLength(80)
    expect(takeNavigationPage(items, 2, NAVIGATION_ITEM_PAGE_SIZE)).toHaveLength(160)
    expect(hasMoreNavigationItems(items.length, 2, NAVIGATION_ITEM_PAGE_SIZE)).toBe(true)
    expect(hasMoreNavigationItems(160, 2, NAVIGATION_ITEM_PAGE_SIZE)).toBe(false)
  })
})
