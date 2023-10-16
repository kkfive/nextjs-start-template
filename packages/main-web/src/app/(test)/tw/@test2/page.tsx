export default async function TwTest2Page() {
  async function getData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('hello')
      }, 1000)
    })
  }
  await getData()
  return <div> test2 </div>
}
