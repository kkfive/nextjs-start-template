'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { DemoWrapper } from '@/components/demo/demo-wrapper'
import { cn } from '@/lib/utils'

// ── 颜色配置 ──
type ColorGroup = {
  name: string
  description: string
  colors: { label: string, class: string, hex: string }[]
}

const tailwindColors: ColorGroup[] = [
  {
    name: '红色系',
    description: '用于错误状态、危险操作和删除提示',
    colors: [
      { label: '50', class: 'bg-red-50', hex: '#fef2f2' },
      { label: '100', class: 'bg-red-100', hex: '#fee2e2' },
      { label: '200', class: 'bg-red-200', hex: '#fecaca' },
      { label: '300', class: 'bg-red-300', hex: '#fca5a5' },
      { label: '400', class: 'bg-red-400', hex: '#f87171' },
      { label: '500', class: 'bg-red-500', hex: '#ef4444' },
      { label: '600', class: 'bg-red-600', hex: '#dc2626' },
      { label: '700', class: 'bg-red-700', hex: '#b91c1c' },
      { label: '800', class: 'bg-red-800', hex: '#991b1b' },
      { label: '900', class: 'bg-red-900', hex: '#7f1d1d' },
      { label: '950', class: 'bg-red-950', hex: '#450a0a' },
    ],
  },
  {
    name: '橙色系',
    description: '用于警告状态、注意提示和业务错误',
    colors: [
      { label: '50', class: 'bg-orange-50', hex: '#fff7ed' },
      { label: '100', class: 'bg-orange-100', hex: '#ffedd5' },
      { label: '200', class: 'bg-orange-200', hex: '#fed7aa' },
      { label: '300', class: 'bg-orange-300', hex: '#fdba74' },
      { label: '400', class: 'bg-orange-400', hex: '#fb923c' },
      { label: '500', class: 'bg-orange-500', hex: '#f97316' },
      { label: '600', class: 'bg-orange-600', hex: '#ea580c' },
      { label: '700', class: 'bg-orange-700', hex: '#c2410c' },
      { label: '800', class: 'bg-orange-800', hex: '#9a3412' },
      { label: '900', class: 'bg-orange-900', hex: '#7c2d12' },
      { label: '950', class: 'bg-orange-950', hex: '#431407' },
    ],
  },
  {
    name: '黄色系',
    description: '用于提示信息、高亮标记和警告状态',
    colors: [
      { label: '50', class: 'bg-yellow-50', hex: '#fefce8' },
      { label: '100', class: 'bg-yellow-100', hex: '#fef9c3' },
      { label: '200', class: 'bg-yellow-200', hex: '#fef08a' },
      { label: '300', class: 'bg-yellow-300', hex: '#fde047' },
      { label: '400', class: 'bg-yellow-400', hex: '#facc15' },
      { label: '500', class: 'bg-yellow-500', hex: '#eab308' },
      { label: '600', class: 'bg-yellow-600', hex: '#ca8a04' },
      { label: '700', class: 'bg-yellow-700', hex: '#a16207' },
      { label: '800', class: 'bg-yellow-800', hex: '#854d0e' },
      { label: '900', class: 'bg-yellow-900', hex: '#713f12' },
      { label: '950', class: 'bg-yellow-950', hex: '#422006' },
    ],
  },
  {
    name: '绿色系',
    description: '用于成功状态、正向反馈和安全提示',
    colors: [
      { label: '50', class: 'bg-green-50', hex: '#f0fdf4' },
      { label: '100', class: 'bg-green-100', hex: '#dcfce7' },
      { label: '200', class: 'bg-green-200', hex: '#bbf7d0' },
      { label: '300', class: 'bg-green-300', hex: '#86efac' },
      { label: '400', class: 'bg-green-400', hex: '#4ade80' },
      { label: '500', class: 'bg-green-500', hex: '#22c55e' },
      { label: '600', class: 'bg-green-600', hex: '#16a34a' },
      { label: '700', class: 'bg-green-700', hex: '#15803d' },
      { label: '800', class: 'bg-green-800', hex: '#166534' },
      { label: '900', class: 'bg-green-900', hex: '#14532d' },
      { label: '950', class: 'bg-green-950', hex: '#052e16' },
    ],
  },
  {
    name: '蓝色系',
    description: '用于主色调、链接、信息和主要交互',
    colors: [
      { label: '50', class: 'bg-blue-50', hex: '#eff6ff' },
      { label: '100', class: 'bg-blue-100', hex: '#dbeafe' },
      { label: '200', class: 'bg-blue-200', hex: '#bfdbfe' },
      { label: '300', class: 'bg-blue-300', hex: '#93c5fd' },
      { label: '400', class: 'bg-blue-400', hex: '#60a5fa' },
      { label: '500', class: 'bg-blue-500', hex: '#3b82f6' },
      { label: '600', class: 'bg-blue-600', hex: '#2563eb' },
      { label: '700', class: 'bg-blue-700', hex: '#1d4ed8' },
      { label: '800', class: 'bg-blue-800', hex: '#1e40af' },
      { label: '900', class: 'bg-blue-900', hex: '#1e3a8a' },
      { label: '950', class: 'bg-blue-950', hex: '#172554' },
    ],
  },
  {
    name: '紫蓝色系',
    description: '品牌主色区域，用于关键交互和标识',
    colors: [
      { label: '50', class: 'bg-indigo-50', hex: '#eef2ff' },
      { label: '100', class: 'bg-indigo-100', hex: '#e0e7ff' },
      { label: '200', class: 'bg-indigo-200', hex: '#c7d2fe' },
      { label: '300', class: 'bg-indigo-300', hex: '#a5b4fc' },
      { label: '400', class: 'bg-indigo-400', hex: '#818cf8' },
      { label: '500', class: 'bg-indigo-500', hex: '#6366f1' },
      { label: '600', class: 'bg-indigo-600', hex: '#4f46e5' },
      { label: '700', class: 'bg-indigo-700', hex: '#4338ca' },
      { label: '800', class: 'bg-indigo-800', hex: '#3730a3' },
      { label: '900', class: 'bg-indigo-900', hex: '#312e81' },
      { label: '950', class: 'bg-indigo-950', hex: '#1e1b4b' },
    ],
  },
]

type TokenItem = {
  label: string
  tw: string
  class: string
  value: string
  usage: string
  pair?: {
    label: string
    tw: string
    class: string
    value: string
  }
}

type TokenGroup = {
  name: string
  description: string
  items: TokenItem[]
}

const themeTokens: TokenGroup[] = [
  {
    name: 'Background 背景色',
    description: '所有可用的背景颜色类名',
    items: [
      { label: 'background', tw: 'bg-background', class: 'bg-[var(--surface-page)]', value: 'oklch(0.96 0.008 270)', usage: '页面底层背景' },
      { label: 'card', tw: 'bg-card', class: 'bg-[var(--surface-card)]', value: 'oklch(0.985 0.006 270)', usage: '卡片、面板背景' },
      { label: 'popover', tw: 'bg-popover', class: 'bg-[var(--surface-popover)]', value: 'oklch(0.99 0.005 270)', usage: '弹窗、下拉菜单背景' },
      { label: 'muted', tw: 'bg-muted', class: 'bg-[var(--surface-muted)]', value: 'oklch(0.92 0.01 270)', usage: '表格交替行、标签背景' },
      { label: 'primary', tw: 'bg-primary', class: 'bg-[var(--action-primary)]', value: 'oklch(0.55 0.18 270)', usage: '主按钮、CTA 背景' },
      { label: 'secondary', tw: 'bg-secondary', class: 'bg-[var(--action-secondary)]', value: 'oklch(0.93 0.01 270)', usage: '次按钮、取消背景' },
      { label: 'accent', tw: 'bg-accent', class: 'bg-[var(--action-accent)]', value: 'oklch(0.62 0.2 25)', usage: '选中态、高亮背景' },
      { label: 'destructive', tw: 'bg-destructive', class: 'bg-[var(--action-destructive)]', value: 'oklch(0.55 0.2 25)', usage: '删除、危险操作背景' },
      { label: 'success', tw: 'bg-success', class: 'bg-[var(--action-success)]', value: 'oklch(0.55 0.16 145)', usage: '成功状态背景' },
      { label: 'warning', tw: 'bg-warning', class: 'bg-[var(--action-warning)]', value: 'oklch(0.7 0.14 85)', usage: '警告状态背景' },
    ],
  },
  {
    name: 'Text 文字色',
    description: '所有可用的文字颜色类名',
    items: [
      { label: 'primary', tw: 'text-primary', class: 'bg-[var(--text-primary)]', value: 'oklch(0.55 0.18 270)', usage: '品牌色、链接、强调文字' },
      { label: 'foreground', tw: 'text-foreground', class: 'bg-[var(--text-default)]', value: 'oklch(0.15 0.02 270)', usage: '正文、标题、主要文字' },
      { label: 'muted-foreground', tw: 'text-muted-foreground', class: 'bg-[var(--text-muted)]', value: 'oklch(0.5 0.02 270)', usage: '次要信息、占位符、禁用状态' },
      { label: 'primary-foreground', tw: 'text-primary-foreground', class: 'bg-[var(--action-primary-text)]', value: 'oklch(0.96 0.008 270)', usage: '主按钮上的文字' },
      { label: 'secondary-foreground', tw: 'text-secondary-foreground', class: 'bg-[var(--action-secondary-text)]', value: 'oklch(0.4 0.03 270)', usage: '次按钮上的文字' },
      { label: 'accent-foreground', tw: 'text-accent-foreground', class: 'bg-[var(--action-accent-text)]', value: 'oklch(0.96 0.008 270)', usage: '高亮/选中项上的文字' },
      { label: 'destructive-foreground', tw: 'text-destructive-foreground', class: 'bg-[var(--action-destructive-text)]', value: 'oklch(0.96 0.008 270)', usage: '危险按钮上的文字' },
      { label: 'success-foreground', tw: 'text-success-foreground', class: 'bg-[var(--action-success-text)]', value: 'oklch(0.96 0.008 270)', usage: '成功按钮/标签上的文字' },
      { label: 'warning-foreground', tw: 'text-warning-foreground', class: 'bg-[var(--action-warning-text)]', value: 'oklch(0.2 0.05 85)', usage: '警告按钮/标签上的文字' },
    ],
  },
  {
    name: 'Action 交互配对',
    description: '背景色与前景文字色成对使用，直观展示按钮/标签的实际效果',
    items: [
      {
        label: 'Primary',
        tw: 'bg-primary',
        class: 'bg-[var(--action-primary)]',
        value: 'oklch(0.55 0.18 270)',
        usage: '主按钮、CTA、关键操作',
        pair: { label: '文字', tw: 'text-primary-foreground', class: 'bg-[var(--action-primary-text)]', value: 'oklch(0.96 0.008 270)' },
      },
      {
        label: 'Secondary',
        tw: 'bg-secondary',
        class: 'bg-[var(--action-secondary)]',
        value: 'oklch(0.93 0.01 270)',
        usage: '次按钮、取消、返回',
        pair: { label: '文字', tw: 'text-secondary-foreground', class: 'bg-[var(--action-secondary-text)]', value: 'oklch(0.4 0.03 270)' },
      },
      {
        label: 'Accent',
        tw: 'bg-accent',
        class: 'bg-[var(--action-accent)]',
        value: 'oklch(0.62 0.2 25)',
        usage: '选中态、高亮、标签',
        pair: { label: '文字', tw: 'text-accent-foreground', class: 'bg-[var(--action-accent-text)]', value: 'oklch(0.96 0.008 270)' },
      },
      {
        label: 'Destructive',
        tw: 'bg-destructive',
        class: 'bg-[var(--action-destructive)]',
        value: 'oklch(0.55 0.2 25)',
        usage: '删除、退出、危险操作',
        pair: { label: '文字', tw: 'text-destructive-foreground', class: 'bg-[var(--action-destructive-text)]', value: 'oklch(0.96 0.008 270)' },
      },
      {
        label: 'Success',
        tw: 'bg-success',
        class: 'bg-[var(--action-success)]',
        value: 'oklch(0.55 0.16 145)',
        usage: '成功状态、正向反馈、通过',
        pair: { label: '文字', tw: 'text-success-foreground', class: 'bg-[var(--action-success-text)]', value: 'oklch(0.96 0.008 270)' },
      },
      {
        label: 'Warning',
        tw: 'bg-warning',
        class: 'bg-[var(--action-warning)]',
        value: 'oklch(0.7 0.14 85)',
        usage: '警告状态、注意提示、待处理',
        pair: { label: '文字', tw: 'text-warning-foreground', class: 'bg-[var(--action-warning-text)]', value: 'oklch(0.2 0.05 85)' },
      },
    ],
  },
  {
    name: 'Border 边框',
    description: '边框、分割线、焦点指示器',
    items: [
      { label: 'border', tw: 'border-border', class: 'bg-[var(--border-default)]', value: 'oklch(0.82 0.015 270)', usage: '卡片边框、分割线' },
      { label: 'input', tw: 'border-input', class: 'bg-[var(--border-input)]', value: 'oklch(0.82 0.015 270)', usage: '输入框、选择器边框' },
      { label: 'strong', tw: 'border-[var(--border-strong)]', class: 'bg-[var(--border-strong)]', value: 'oklch(0.7 0.02 270)', usage: '表头分割线、弹窗边框' },
      { label: 'ring', tw: 'ring-ring / outline-ring', class: 'bg-[var(--focus-ring)]', value: 'oklch(0.55 0.18 270)', usage: '焦点指示器、选中轮廓' },
    ],
  },
]

// ── 组件 ──

function ColorSwatch({ color, groupName }: { color: ColorGroup['colors'][0], groupName: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex)
    }
    catch {
      const textarea = document.createElement('textarea')
      textarea.value = color.hex
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex flex-col items-center gap-1.5"
      title={`${groupName} ${color.label} — 点击复制 ${color.hex}`}
    >
      <div
        className={cn(
          'size-14 rounded-xl border border-black/5 shadow-sm transition-shadow duration-200',
          color.class,
          'group-hover:shadow-md',
        )}
      />
      <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
        {color.label}
      </span>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 4 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-background shadow-lg"
          >
            已复制
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function ThemeTokenCard({ item }: { item: TokenItem }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.value)
    }
    catch {
      const textarea = document.createElement('textarea')
      textarea.value = item.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/30"
    >
      <div className="mb-3 flex items-center gap-3">
        {/* Color swatch */}
        <div className="flex gap-1.5">
          <div className={cn('size-10 rounded-lg border border-black/5 shadow-sm', item.class)} />
          {item.pair && (
            <div className={cn('size-10 rounded-lg border border-black/5 shadow-sm', item.pair.class)} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{item.label}</p>
          <p className="text-xs text-muted-foreground">{item.usage}</p>
        </div>
      </div>

      {/* Tailwind classes */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <code className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{item.tw}</code>
        {item.pair && (
          <code className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{item.pair.tw}</code>
        )}
      </div>

      {/* Value + copy */}
      <button
        onClick={handleCopy}
        className="w-full rounded-lg bg-muted/50 px-3 py-1.5 text-left font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="flex items-center justify-between">
          <code className="truncate">{item.value}</code>
          <span className="ml-2 shrink-0 text-[10px] font-medium">
            {copied ? '已复制' : '复制'}
          </span>
        </span>
      </button>
    </motion.div>
  )
}

export default function ColorPalettePage() {
  const [activeTab, setActiveTab] = useState<'tailwind' | 'tokens'>('tailwind')

  return (
    <DemoWrapper>
      <div className="space-y-8">
        {/* Tab Switcher */}
        <div className="flex w-fit gap-1 rounded-xl bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab('tailwind')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              activeTab === 'tailwind'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Tailwind 色谱
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              activeTab === 'tokens'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            主题令牌
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'tailwind'
            ? (
                <motion.div
                  key="tailwind"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Tailwind Colors */}
                  <div className="space-y-6">
                    {tailwindColors.map((group, groupIndex) => (
                      <motion.div
                        key={group.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.06, duration: 0.35 }}
                        className="space-y-3"
                      >
                        <div className="flex items-baseline gap-3">
                          <h3 className="text-base font-semibold">{group.name}</h3>
                          <span className="text-xs text-muted-foreground">{group.description}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {group.colors.map(color => (
                            <ColorSwatch key={color.label} color={color} groupName={group.name} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            : (
                <motion.div
                  key="tokens"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Theme Tokens */}
                  <div className="space-y-8">
                    {themeTokens.map((group, groupIndex) => (
                      <motion.div
                        key={group.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.08, duration: 0.35 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {group.items.map(item => (
                            <ThemeTokenCard key={item.label} item={item} />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Gradient Showcase */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.35 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold">渐变效果</h3>
                      <p className="text-sm text-muted-foreground">项目中使用的渐变样式及引用方式</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div
                          className="h-24 rounded-2xl"
                          style={{ background: 'var(--gradient-text-primary)' }}
                        />
                        <p className="text-xs font-medium text-foreground">文字渐变 (Primary)</p>
                        <code className="block text-[10px] text-muted-foreground">{'style={{ background: \'var(--gradient-text-primary)\' }}'}</code>
                      </div>
                      <div className="space-y-2">
                        <div
                          className="h-24 rounded-2xl"
                          style={{ background: 'var(--gradient-text-secondary)' }}
                        />
                        <p className="text-xs font-medium text-foreground">文字渐变 (Secondary)</p>
                        <code className="block text-[10px] text-muted-foreground">{'style={{ background: \'var(--gradient-text-secondary)\' }}'}</code>
                      </div>
                      <div className="space-y-2">
                        <div className="gradient-bg-soft h-24 rounded-2xl" />
                        <p className="text-xs font-medium text-foreground">柔和渐变背景</p>
                        <code className="block text-[10px] text-muted-foreground">className="gradient-bg-soft"</code>
                      </div>
                      <div className="space-y-2">
                        <div className="gradient-bg h-24 rounded-2xl" />
                        <p className="text-xs font-medium text-foreground">品牌渐变</p>
                        <code className="block text-[10px] text-muted-foreground">className="gradient-bg"</code>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
        </AnimatePresence>
      </div>
    </DemoWrapper>
  )
}
