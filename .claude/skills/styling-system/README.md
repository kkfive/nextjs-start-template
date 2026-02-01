# Styling System Skill

Ant Design 样式自定义规范 Skill

## 用途

当需要自定义 Ant Design 组件样式时，提供 5 级优先级决策体系和最佳实践。

## 使用场景

- 调整组件样式（颜色、尺寸、间距）
- 实现主题切换
- 自定义组件外观
- 解决样式冲突
- 样式优先级问题

## 调用方式

```
/styling-system
```

## 包含内容

- **快速参考**：5 级优先级体系、决策流程图
- **核心原则**：ConfigProvider → CSS Variables → 组件 API → Tailwind → SCSS
- **反模式警告**：常见错误和正确做法
- **详细规范**：完整的样式自定义指南（references/styling-priority.md）

## 优先级体系

1. **ConfigProvider** - 全局主题配置
2. **CSS Variables** - 设计系统 Token
3. **组件 API props** - 组件实例配置
4. **className + Tailwind** - 工具类样式
5. **SCSS 覆盖** - 最后手段（需注释）

## 示例

### 全局按钮样式

```typescript
<ConfigProvider
  theme={{
    components: {
      Button: {
        fontWeight: 600,
        contentFontSize: 16,
      },
    },
  }}
>
```

### 主题切换

```css
:root[data-theme='blue'] {
  --platform-primary: #1e40af;
}
```

### 组件实例样式

```typescript
<Input
  styles={{
    input: { fontSize: 18 },
  }}
  classNames={{
    input: 'placeholder:text-gray-400',
  }}
/>
```

## 相关文档

- `references/styling-priority.md` - 完整样式规范
- `src/app/layout.tsx` - ConfigProvider 配置
- `src/styles/tailwind.css` - CSS Variables 定义
