# Server → Client 边界序列化（约束）

Server Component 向 Client Component 传 props 时，值必须可被 React 序列化。

## 可以传

- 基础类型：`string` / `number` / `boolean` / `null` / `undefined`
- 数组与 plain object
- `Date`（自动序列化为字符串再恢复）
- React 元素（仅作为 children，Server 渲染好的）
- 函数 props 仅当函数是 **Server Action**（`'use server'`）

## 不能传

- `class` 实例（如 `URL`、自定义类）
- `Map` / `Set` / `WeakMap`
- 普通函数 / 闭包（必须是 Server Action）
- Symbol
- Promise（除非作为 Suspense 的 `use()` 资源传递）
- 含循环引用的对象

## 实践

Domain Service 返回值要尽早"扁平化"成 plain object，再跨边界：

```tsx
// ✅ Server Component
const dto = await materialController.getDetail(http, id)
// dto: { id: string, name: string, createdAt: string }
return <ClientCard data={dto} />

// ❌ 直接传 Domain 内部聚合（含方法或 class）
return <ClientCard model={materialEntity} />
```

数据变更行为通过 Server Action 传递：

```tsx
// app/actions/material.ts
'use server'
export async function updateMaterial(id: string, patch: Patch) { /* ... */ }

// Server Component → Client
<ClientForm onSubmit={updateMaterial} />
```
