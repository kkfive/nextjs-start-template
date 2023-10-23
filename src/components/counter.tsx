'use client'

import { useState } from 'react'

export default function Counter({
  dictionary,
}: {
  dictionary: {
    increment: string
    decrement: string
  }
}) {
  const [count, setCount] = useState(0)
  return (
    <p>
      This compoment is rendered on client:
      <button className="btn" onClick={() => setCount(n => n - 1)}>
        {dictionary.decrement}
      </button>
      <span className="mx-2">
        {count}
      </span>

      <button className="btn" onClick={() => setCount(n => n + 1)}>
        {dictionary.increment}
      </button>
    </p>
  )
}
