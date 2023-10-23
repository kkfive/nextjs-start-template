export default function Layout(props: {
  children: React.ReactNode
  test1: React.ReactNode
  test2: React.ReactNode
}) {
  return (
    <>
      {props.children}
      {props.test1}
      {props.test2}
    </>
  )
}
