import type { DemoNavCategory, DemoNavItem } from './nav'

export const RECENT_DEMO_LIMIT = 8
export const NAVIGATION_ITEM_PAGE_SIZE = 80

export function takeNavigationPage<T>(items: readonly T[], page: number, pageSize: number) {
  return items.slice(0, Math.max(1, page) * pageSize)
}

export function hasMoreNavigationItems(total: number, page: number, pageSize: number) {
  return total > Math.max(1, page) * pageSize
}

export type NavigationFilter = 'all' | 'recent'

export function isDemoNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getActiveDemoCategory(
  navConfig: DemoNavCategory[],
  pathname: string,
) {
  return navConfig.find(category =>
    category.items.some(item => isDemoNavItemActive(pathname, item.href)),
  )?.id
}

function matchesQuery(item: DemoNavItem, category: DemoNavCategory, query: string) {
  const haystack = [
    category.name,
    item.name,
    item.description,
    ...item.aliases,
  ].join(' ').toLocaleLowerCase()

  return haystack.includes(query)
}

export function filterDemoNavigation(
  navConfig: DemoNavCategory[],
  query: string,
  filter: NavigationFilter,
  recentIds: readonly string[],
) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const recentSet = new Set(recentIds)

  return navConfig
    .map(category => ({
      ...category,
      items: category.items
        .filter(item => filter === 'all' || recentSet.has(item.id))
        .filter(item => !normalizedQuery || matchesQuery(item, category, normalizedQuery))
        .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter(category => category.items.length > 0)
    .toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function addRecentDemo(
  recentIds: readonly string[],
  itemId: string,
  capacity = RECENT_DEMO_LIMIT,
) {
  return [itemId, ...recentIds.filter(id => id !== itemId)].slice(0, capacity)
}
