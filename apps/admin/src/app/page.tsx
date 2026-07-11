import { fetchHitokoto } from '@kkfive/rpc'
import { rpcServer } from '@/service/rpc-server'

// admin 示例：SSR 直取，使用已注入的服务端 HttpService 实例
async function getHitokoto() {
  try {
    return await fetchHitokoto(rpcServer)
  }
  catch {
    return null
  }
}

export default async function HomePage() {
  const hitokoto = await getHitokoto()

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 720 }}>
      <h1>Admin（管理后台示例）</h1>
      <p>
        这是 monorepo 中的
        <code>apps/admin</code>
        ，演示 Next.js SSR 消费
        <code>@kkfive/rpc</code>
        。
      </p>

      <h2>SSR 直取示例</h2>
      <blockquote style={{ padding: '1rem', borderLeft: '3px solid #888', background: '#f5f5f5' }}>
        {hitokoto?.hitokoto ?? '（加载失败，hitokoto 服务不可达）'}
        {hitokoto?.from
          ? (
              <footer>
                ——
                {hitokoto.from}
              </footer>
            )
          : null}
      </blockquote>

      <h2>项目结构</h2>
      <ul>
        <li>
          <code>src/app/</code>
          {' '}
          — Next.js App Router
        </li>
        <li>
          <code>domain/</code>
          {' '}
          — Domain 适配层（re-export @kkfive/rpc）
        </li>
        <li>
          <code>src/service/</code>
          {' '}
          — HttpService 实例注入
        </li>
      </ul>
    </main>
  )
}
