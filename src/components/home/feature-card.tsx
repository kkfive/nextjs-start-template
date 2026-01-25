'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  href: string
  category: string
  priority: 1 | 2 | 3 | 4 | 5
  delay?: number
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  category,
  priority,
  delay = 0,
}: FeatureCardProps) {
  // 视觉权重映射：根据优先级设置卡片最小高度
  const minHeight
    = priority >= 5 ? 'min-h-[240px]' : priority >= 4 ? 'min-h-[200px]' : 'min-h-[160px]'

  // 优先级徽章颜色
  const priorityColor
    = priority >= 5
      ? 'bg-red-50 text-red-700 border-red-200'
      : priority >= 4
        ? 'bg-orange-50 text-orange-700 border-orange-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className={`group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm ${minHeight}`}
      >
        {/* Category Badge with Priority Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${priorityColor}`}>
            {category}
          </div>
          {priority >= 4 && (
            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs font-bold text-white shadow-sm">
              {priority}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            {icon}
          </div>
        )}

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="mb-4 flex-1 text-sm text-neutral-600">{description}</p>

        {/* Arrow indicator */}
        <div className="flex items-center text-sm font-medium text-blue-600 transition-transform group-hover:translate-x-1">
          <span>查看示例</span>
          <ArrowRight className="ml-1 size-4" />
        </div>
      </Link>
    </motion.div>
  )
}
