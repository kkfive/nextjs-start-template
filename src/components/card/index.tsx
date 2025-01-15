import type { CardProps } from './props'
import { cn } from '@base/utils/atom-css'

export function Card({ text, children, className }: CardProps) {
  return (
    <div className={cn('text-[#232323] rounded-lg border bg-white p-4 shadow-sm', className)}>
      <p>{text}</p>
      {children}
    </div>
  )
}
