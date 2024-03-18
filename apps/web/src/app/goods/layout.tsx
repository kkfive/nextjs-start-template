export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <p>goods layout</p>
      {children}
    </div>
  )
}
