'use client'

import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { DemoNavCategory } from '../model/nav'
import { cn } from '@kkfive/ui'
import { LucideArrowRight, LucideCommand, LucideX } from '@kkfive/ui/components/icon'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addRecentDemo,
  filterDemoNavigation,
  getActiveDemoCategory,
  hasMoreNavigationItems,
  isDemoNavItemActive,
  NAVIGATION_ITEM_PAGE_SIZE,
} from '../model/navigation-state'

const RECENT_STORAGE_KEY = 'demo-navigation-recent'

type CommandCenterProps = {
  navConfig: DemoNavCategory[]
  onClose: () => void
}

type FlatEntry
  = | { kind: 'header', category: DemoNavCategory }
    | { kind: 'item', category: DemoNavCategory, item: DemoNavCategory['items'][number] }

export function CommandCenter({ navConfig, onClose }: CommandCenterProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'recent'>('all')
  const [recentIds, setRecentIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [highlighted, setHighlighted] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored))
        setRecentIds(stored.filter(id => typeof id === 'string'))
    }
    catch {
      setRecentIds([])
    }
    searchRef.current?.focus()
  }, [])

  const totalCount = useMemo(
    () => navConfig.reduce((sum, category) => sum + category.items.length, 0),
    [navConfig],
  )

  const entries = useMemo<FlatEntry[]>(() => {
    const navigation = filterDemoNavigation(navConfig, query, filter, recentIds)
    return navigation.flatMap((category): FlatEntry[] => [
      { kind: 'header', category },
      ...category.items.map(item => ({ kind: 'item' as const, category, item })),
    ])
  }, [navConfig, query, filter, recentIds])

  const itemEntries = useMemo(() => entries.filter(entry => entry.kind === 'item'), [entries])
  const visibleEntries = useMemo(() => {
    const allowedItems = page * NAVIGATION_ITEM_PAGE_SIZE
    let seen = 0
    const result: FlatEntry[] = []
    for (const entry of entries) {
      if (entry.kind === 'header') {
        const remaining = allowedItems - seen
        if (remaining <= 0)
          break
        result.push(entry)
      }
      else {
        seen += 1
        if (seen <= allowedItems)
          result.push(entry)
      }
    }
    return result
  }, [entries, page])

  const visibleItems = useMemo(
    () => visibleEntries.filter((entry): entry is Extract<FlatEntry, { kind: 'item' }> => entry.kind === 'item'),
    [visibleEntries],
  )

  const highlightTarget = visibleItems[Math.min(highlighted, visibleItems.length - 1)]

  const openItem = (itemId: string, href: string) => {
    const next = addRecentDemo(recentIds, itemId)
    setRecentIds(next)
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
    }
    catch {
      // localStorage 不可用时静默降级为会话内最近记录。
    }
    onClose()
    router.push(href)
  }

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted(current => Math.min(current + 1, visibleItems.length - 1))
    }
    else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted(current => Math.max(current - 1, 0))
    }
    else if (event.key === 'Enter' && highlightTarget) {
      event.preventDefault()
      openItem(highlightTarget.item.id, highlightTarget.item.href)
    }
  }

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  const switchQuery = (value: string) => {
    setQuery(value)
    setPage(1)
    setHighlighted(0)
  }

  const switchFilter = (value: 'all' | 'recent') => {
    setFilter(value)
    setPage(1)
    setHighlighted(0)
  }

  const activeCategoryId = getActiveDemoCategory(navConfig, pathname)
  const activeCategory = navConfig.find(category => category.id === activeCategoryId)

  return (
    <div
      className="flex max-h-full w-full flex-col overflow-hidden rounded-t-3xl border border-border/70 bg-card/95 shadow-soft backdrop-blur-xl sm:rounded-3xl"
      onKeyDown={handleKeyDown}
    >
      {/* 搜索头部：当前语境 + 全局搜索 */}
      <div className="shrink-0 border-b border-border/60 p-4 pb-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="meta-mono flex min-w-0 items-center gap-2 text-muted-foreground">
            <span>EXPERIMENT INDEX</span>
            <span aria-hidden className="h-px w-6 bg-border" />
            <span className="truncate font-mono">{activeCategory?.name ?? '全部演示'}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {String(totalCount).padStart(2, '0')}
              {' '}
              项
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭演示索引"
              className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LucideX className="size-4" aria-hidden />
            </button>
          </div>
        </div>
        <label className="flex min-h-11 items-center gap-2.5 rounded-2xl border border-border/60 bg-background/70 px-3.5 focus-within:ring-2 focus-within:ring-ring/50">
          <LucideCommand className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">搜索演示</span>
          <input
            ref={searchRef}
            value={query}
            onChange={event => switchQuery(event.target.value)}
            placeholder="搜索演示名称、描述或别名…"
            role="combobox"
            aria-expanded="true"
            aria-controls="demo-command-list"
            aria-activedescendant={highlightTarget ? `demo-command-item-${highlightTarget.item.id}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" onClick={() => switchQuery('')} className="min-h-11 shrink-0 px-1 text-xs text-muted-foreground hover:text-foreground">
              清空
            </button>
          )}
        </label>
        <div className="mt-2.5 flex items-center gap-1.5">
          {(['all', 'recent'] as const).map(value => (
            <button
              key={value}
              type="button"
              onClick={() => switchFilter(value)}
              className={cn(
                'min-h-11 rounded-xl px-3 text-xs transition-colors',
                filter === value ? 'bg-accent/12 text-accent' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {value === 'all' ? '全部' : '最近'}
            </button>
          ))}
        </div>
      </div>

      {/* 结果列表：分组扁平渲染，键盘可导航 */}
      <div
        ref={listRef}
        id="demo-command-list"
        role="listbox"
        aria-label="演示列表"
        className="min-h-0 flex-1 scrollbar-none overflow-y-auto p-2"
      >
        {visibleEntries.map((entry) => {
          if (entry.kind === 'header') {
            return (
              <div key={`header-${entry.category.id}`} className="mt-2 mb-1 flex items-center gap-2 px-3 first:mt-0" role="presentation">
                <span aria-hidden className={cn('flex size-6 shrink-0 items-center justify-center rounded-lg [&_svg]:size-3.5', entry.category.id === activeCategoryId ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground')}>
                  {entry.category.icon}
                </span>
                <span className="min-w-0 flex-1 text-xs leading-4 font-semibold break-words">{entry.category.name}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{entry.category.items.length}</span>
              </div>
            )
          }

          const active = isDemoNavItemActive(pathname, entry.item.href)
          const isHighlighted = highlightTarget?.item.id === entry.item.id
          return (
            <Link
              key={entry.item.id}
              id={`demo-command-item-${entry.item.id}`}
              href={entry.item.href}
              role="option"
              aria-selected={isHighlighted}
              aria-current={active ? 'page' : undefined}
              data-highlighted={isHighlighted}
              onClick={(event) => {
                event.preventDefault()
                openItem(entry.item.id, entry.item.href)
              }}
              className={cn(
                'group flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 transition-colors',
                isHighlighted ? 'bg-accent/10' : 'hover:bg-muted/70',
                active && 'text-accent',
              )}
            >
              <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', active ? 'bg-accent' : 'bg-border')} />
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-sm', active ? 'font-medium' : 'text-foreground/85')}>{entry.item.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{entry.item.description}</span>
              </span>
              <LucideArrowRight aria-hidden className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5', isHighlighted && 'text-accent')} />
            </Link>
          )
        })}

        {!itemEntries.length && (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            {filter === 'recent' && !query ? '还没有最近访问的演示' : '没有匹配的演示'}
          </p>
        )}

        {hasMoreNavigationItems(itemEntries.length, page, NAVIGATION_ITEM_PAGE_SIZE) && (
          <button
            type="button"
            onClick={() => setPage(current => current + 1)}
            className="mt-1 min-h-11 w-full rounded-2xl px-3 text-center text-xs text-muted-foreground hover:bg-muted/70"
          >
            加载更多 · 剩余
            {' '}
            {itemEntries.length - visibleItems.length}
            {' '}
            项
          </button>
        )}
      </div>

      {/* 键盘提示 */}
      <div className="flex shrink-0 items-center gap-4 border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>
          <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
          {' '}
          选择
        </span>
        <span>
          <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono">Enter</kbd>
          {' '}
          打开
        </span>
        <span>
          <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
          {' '}
          关闭
        </span>
        <span className="ml-auto hidden sm:inline">
          <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono">⌘K</kbd>
          {' '}
          切换索引
        </span>
      </div>
    </div>
  )
}
