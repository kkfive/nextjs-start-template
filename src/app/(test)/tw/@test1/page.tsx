export default async function TwTest1Page() {
  async function getData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('hello')
      }, 1000)
    })
  }
  await getData()
  return <div> test1 </div>
}
