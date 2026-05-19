import type { CardProps } from './props'
import { cn } from '@/lib/utils'

export function Card({ text, children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card p-6 shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-1 hover:shadow-lg hover:border-border',
        className,
      )}
    >
      <p className="text-foreground">{text}</p>
      {children}
    </div>
  )
}
