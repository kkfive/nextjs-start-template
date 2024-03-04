interface LayoutProps {
  children: React.ReactNode
  detail: React.ReactNode
  a: React.ReactNode
}
export default function Layout({ children, a, detail }: Readonly<LayoutProps>) {
  return (
    <div>
      <p>goods/[id]/layout</p>
      {children}
      {a}
      {detail}
    </div>
  )
}
