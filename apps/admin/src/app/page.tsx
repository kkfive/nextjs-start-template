// admin 最小欢迎页：演示 SSR + service 实例的接入点
// 写法参照 apps/client/src/features/example（feature-first：本页业务能力应放入 src/features/<feature>/）
export default function HomePage() {
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

      <h2>项目结构</h2>
      <ul>
        <li>
          <code>src/app/</code>
          {' '}
          — Next.js App Router
        </li>
        <li>
          <code>src/features/</code>
          {' '}
          — 业务调用与页面能力
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
