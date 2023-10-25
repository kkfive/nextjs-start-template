import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export default async function twPage() {
  async function getData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('hello')
      }, 3000)
    })
  }
  const newClass = clsx({ 'bg-white': false, 'bg-red': true })
  const classNameResult = twMerge('px-2 py-1 bg-red hover:bg-green', 'p-3 bg-[#B91C1C]')

  await getData()

  return (
    <div>
      <div className="btn">sadsda</div>
      <div className=":uno: text-6 font-800 text-red">
        transform-text
      </div>
      <div className="font-(light mono) hover:(bg-gray-400 font-medium)">
        gggggg
      </div>
      <div text-red text-center text-5xl animate-bounce>
        unocss
      </div>
      <div>
        <span className="i-mdi-uber text-32 text-red"></span>
      </div>
      <div className={classNameResult}>twMerge</div>
      <div className={newClass}>clsx</div>

    </div>
  )
}
