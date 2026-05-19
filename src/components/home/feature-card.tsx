'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LucideArrowUpRight } from '@/components/ui/icon'

export type FeatureCardProps = {
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
  const categoryColors: Record<string, string> = {
    'UI': 'from-violet-500 to-fuchsia-500',
    'Forms': 'from-blue-500 to-cyan-500',
    'Data Fetching': 'from-emerald-500 to-teal-500',
    'Error Handling': 'from-amber-500 to-orange-500',
    'State Management': 'from-rose-500 to-pink-500',
  }

  const gradientClass = categoryColors[category] || 'from-primary to-gradient-mid'
  const isHighPriority = priority >= 4

  return (
    <motion.div
      initial={{ opacity: 1, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={href}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        {/* Top gradient bar */}
        <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${gradientClass} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

        {/* Icon */}
        {icon && (
          <div className={`mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-3 flex items-center gap-2">
          <span className={`inline-flex rounded-full bg-gradient-to-r ${gradientClass} bg-clip-text px-2 py-0.5 text-xs font-semibold text-transparent`}>
            {category}
          </span>
          {isHighPriority && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              P
              {priority}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Arrow */}
        <div className="flex items-center text-sm font-medium text-primary transition-all group-hover:gap-1">
          <span>查看示例</span>
          <LucideArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    </motion.div>
  )
}
