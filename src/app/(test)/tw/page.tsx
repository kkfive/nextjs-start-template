export default async function twPage() {
  async function getData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('hello')
      }, 3000)
    })
  }
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
    </div>
  )
}
