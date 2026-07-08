import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLElement> & {
  primary?: boolean
  danger?: boolean
  sm?: boolean
  lg?: boolean
  success?: boolean
  signal?: boolean
  ghost?: boolean
  rect?: boolean
}
