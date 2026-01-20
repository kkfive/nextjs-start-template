import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  href: string
  category: string
  delay?: number
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  category,
  delay = 0,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {/* Category Badge */}
      <div className="mb-4 inline-flex self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
        {category}
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
  )
}
