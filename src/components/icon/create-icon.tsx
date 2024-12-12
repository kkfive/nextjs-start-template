import { cn } from '@base/utils/atom-css'

export function CreateIcon(className: string) {
  return (props: { className?: string }) => {
    return <i className={cn(className, props.className)}></i>
  }
}
