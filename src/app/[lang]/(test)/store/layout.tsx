export default function Layout(props: {
  children: React.ReactNode
  storeTest: React.ReactNode
}) {
  return (
    <>
      {props.children}
      {props.storeTest}
    </>
  )
}
