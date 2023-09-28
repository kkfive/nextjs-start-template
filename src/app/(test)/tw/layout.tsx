export default function Layout(props: {
  children: React.ReactNode
  test1: React.ReactNode
  test2: React.ReactNode
}) {
  console.log(props)
  return (
    <>
      {props.children}
      {props.test1}
      {props.test2}
    </>
  )
}
