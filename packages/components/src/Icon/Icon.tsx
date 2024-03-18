import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'

interface IconProps {
  iconName: string
  className?: ClassValue[] | string | undefined
  style?: CSSProperties | undefined
}

export default function Icon({ iconName, className, ...props }: IconProps) {
  return (
    <>
      <i className={`${iconName} ${twMerge(clsx(className))}`} {...props} />
    </>
  )
}
