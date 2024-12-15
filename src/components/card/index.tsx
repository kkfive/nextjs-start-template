import type { CardProps } from './props'
import { cn } from '@base/utils/atom-css'

export function Card(props: CardProps) {
  return (
    <div className={cn('text-[#232323] rounded-lg border bg-white p-4 shadow-sm', props.className)}>
      <p>{props.text}</p>
      {props.children}
    </div>
  )
}
