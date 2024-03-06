// import MaterialSymbols10k from '~icons/material-symbols/10k'

export default function Page() {
  const datetime = new Date().getTime()
  return (
    <div>
      123
      <i className="icon-[eos-icons--bubble-loading]"></i>
      {/* <MaterialSymbols10k className="inline-block" /> */}
      <div className="w-99 h-36 border border-red-200">
        当前@a 渲染时间：
        {datetime}
      </div>
    </div>
  )
}
