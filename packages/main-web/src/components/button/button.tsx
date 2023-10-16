import React from 'react'

export interface ButtonProps {
  children?: React.ReactNode
  onClick?: () => void
}
export default function Button(options: ButtonProps): React.ReactElement {
  return (
    <button className="btn" onClick={options.onClick}>{options.children}</button>
  )
}
