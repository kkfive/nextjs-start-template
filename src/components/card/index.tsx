import type { CardProps } from './props'
import { cn } from '@base/utils/atom-css'

export function Card({ text, children, className }: CardProps) {
  return (
    <div className={cn('text-[#232323] rounded-lg border-zinc-200 border bg-white p-4 shadow', className)}>
      <p>{text}</p>
      {children}
    </div>
  )
}
