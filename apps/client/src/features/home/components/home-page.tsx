import Link from 'next/link'

// 模板最小首页：空白起点。接管时可直接改写本文件。
export function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Next.js Start Template</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        模板已就绪。查看
        {' '}
        <Link href="/example" className="link-underline text-accent">example</Link>
        {' '}
        了解 feature-first 写法，或阅读 README「接管本项目」开始开发。
      </p>
    </main>
  )
}
