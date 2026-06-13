# React 组件规范

## 组件定义

```tsx
// 使用函数声明，不使用箭头函数
// ✅ 正确
export function HitokotoCard({ initialData }: HitokotoCardProps) {
  return <div>...</div>
}

// ❌ 错误
export const HitokotoCard = ({ initialData }: HitokotoCardProps) => {
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
interface HitokotoCardProps {
  initialData: Hitokoto.Hitokoto
}

// 或使用 props.ts 文件
// src/components/ui/button/props.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean
}
```

## 核心原则

- **函数声明优先**：使用 `export function` 而非箭头函数
- **明确客户端标记**：需要客户端交互的组件必须添加 `'use client'`
- **类型安全**：所有 Props 必须有明确的类型定义
