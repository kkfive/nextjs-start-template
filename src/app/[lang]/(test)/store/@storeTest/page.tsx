'use client'

import { useBearStore } from '@/store/useBear'

export default function StoreTestPage() {
  const { increase, bears } = useBearStore()
  const increaseHandler = () => {
    const newBears = bears + 1
    increase(newBears)
  }
  return (
    <>
      <div>
        当前 bears 数量：
        {bears}
      </div>

      <div>
        <button className="text-red font-light font-mono btn hover:bg-gray-400 hover:font-medium" onClick={increaseHandler}>increase</button>
      </div>

    </>

  )
}
