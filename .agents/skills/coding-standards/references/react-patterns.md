# React 组件规范

## 组件定义

```tsx
// 公共组件优先使用具名函数声明
export function HitokotoCard({ initialData }: HitokotoCardProps) {
  return <div>...</div>
}
```

## 客户端组件

```tsx
// 客户端组件必须标记 'use client'
'use client'
export function ClientComponent() {
  // 组件逻辑
}
```

## Props 类型定义

```typescript
// 组件 Props 命名: {ComponentName}Props
type HitokotoCardProps = {
  initialData: Hitokoto.Hitokoto
}

// 或使用 props.ts 文件
// apps/{app}/src/components/ui/button/props.ts
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
}
```

## 核心原则

- **具名优先**：公共组件优先 `export function`；局部 callback 与确有类型推导需要的组件可使用箭头函数
- **明确客户端标记**：需要客户端交互的组件必须添加 `'use client'`
- **类型安全**：所有 Props 必须有明确的类型定义
