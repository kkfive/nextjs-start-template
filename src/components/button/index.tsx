import type { ButtonProps } from './props'
import { cn } from '@base/utils/atom-css'

export default function Button(props: ButtonProps) {
  const { className, primary, danger, sm, lg, signal, success, ghost, rect, children, disabled, ...other } = props
  const base = 'rounded border border-transparent font-medium cursor-pointer transition relative mx-1'

  // type
  const normal = 'bg-gray-100 hover:bg-gray-200'

  // size
  const md = 'text-xs py-1.5 px-3'

  const cls = cn(base, normal, md, {
    // type 这些类型是互斥的
    'bg-blue-500 text-white hover:bg-blue-600': primary,
    'bg-red-500 text-white hover:bg-red-600': danger,
    'bg-green-500 text-white hover:bg-green-600': success,
    'text-sky-500 bg-white border border-sky-300 hover:bg-sky-50': signal,
    'bg-transparent border-transparent hover:bg-gray-100': ghost,

    // size
    'text-xs py-1.5 px-3': sm,
    'text-lg py-2 px-6': lg,
    'w-8 h-8 p-0': rect,
  }, {
    'opacity-75 cursor-not-allowed': disabled,
  }, className)

  const _signalSnippet = (
    <span className="absolute right-[-5px] top-[-5px] flex size-3">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
      <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
    </span>
  )

  return (
    <button type="button" className={cls} {...other}>
      {children}
      {signal && _signalSnippet}
    </button>
  )
}
