# Level 3: 组件 API props（单实例）

## 适用

- 单个组件实例需要特殊化
- 组件提供 `style` / `styles` / `classNames` API
- 不能（或不该）影响其他实例

## antd 5.x+ 多部位 API

| API | 用途 | 例 |
|---|---|---|
| `style` | 根元素内联 | `style={{ width: 300 }}` |
| `styles` | 多部位样式对象 | `styles={{ input: { fontSize: 18 } }}` |
| `classNames` | 多部位类名对象 | `classNames={{ input: 'font-medium' }}` |

## 模板

```tsx
// Input
<Input
  placeholder="请输入"
  styles={{
    input: { fontSize: 18, fontWeight: 500 },
    prefix: { color: '#3b82f6' },
    suffix: { color: '#64748b' },
  }}
  classNames={{
    input: 'placeholder:text-gray-400',
    prefix: 'mr-2',
  }}
/>

// Button
<Button
  type="primary"
  style={{ width: '100%' }}
  styles={{ icon: { fontSize: 20 } }}
  classNames={{ icon: 'mr-2' }}
>
  提交
</Button>

// Form.Item
<Form.Item
  label="用户名"
  styles={{ label: { fontWeight: 600 } }}
  classNames={{ label: 'text-gray-700' }}
>
  <Input />
</Form.Item>
```

## 文档查询（必做）

使用 `styles` / `classNames` 前查 [Ant Design 文档](https://ant.design/components/overview-cn/) 看：
- 该组件是否支持
- 可用的"部位 key"有哪些（如 `input` / `prefix` / `suffix`）

详见 `/ant-design` 的 `rules/api-query-required.md`。

## 反例

```tsx
// ❌ 用任意值选择器穿透 antd 内部
<Input className="[&_.ant-input]:text-lg [&_.ant-input]:font-medium" />

// ✅ 用 styles / classNames
<Input
  styles={{ input: { fontSize: 18, fontWeight: 500 } }}
/>
```

## 检查

- [ ] 已确认组件支持 `styles` / `classNames`
- [ ] 没有用 `[&_.ant-*]` 选择器穿透
- [ ] 仅 1-2 处特殊化才用这级；多处重复时升级到第 1 级
