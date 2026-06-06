# Server vs Client Component（决策约束）

Server Component 是默认；只有在以下情况才升级为 Client Component。

## 必须加 `'use client'` 的信号

- 使用 `useState` / `useReducer` / `useEffect` / `useRef`
- 使用浏览器 API（`window`、`document`、`localStorage`、`navigator`）
- 注册事件处理器（`onClick`、`onChange`、`onSubmit` 等）
- 使用 React Query / SWR 等客户端数据 hook
- 使用 Motion / Framer 等需要客户端运行的库

## 应保持 Server Component 的信号

- 仅渲染数据、不交互
- 直接 `await` 数据源（数据库、外部 API、文件）
- 使用密钥、Token 等不能进入浏览器的值
- 计算密集，但结果可被缓存

## 拆分原则

需要"既有交互又有大块只读内容"时：保留 Server 父组件 + 抽出最小 Client 子组件。**不要把整页转 Client**。

```tsx
// app/products/page.tsx — Server
export default async function Page() {
  const data = await getProducts()
  return (
    <Layout>
      <ProductList data={data} />
      <AddToCartButton />  {/* Client，只这一块 */}
    </Layout>
  )
}
```

## 反例

```tsx
// ❌ 整页 'use client' 只为一个按钮
'use client'
export default function Page() {
  const [count, setCount] = useState(0)
  return <ProductList /* 还得 Client 获取数据 */ />
}
```

详细决策表见 `references/file-conventions.md` 与官方文档。
