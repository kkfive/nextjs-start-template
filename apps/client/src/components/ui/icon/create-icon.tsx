import { cn } from '@/lib/utils'

export function CreateIcon(className: string) {
  return (props: { className?: string }) => {
    return <i className={cn(className, props.className)}></i>
  }
}
