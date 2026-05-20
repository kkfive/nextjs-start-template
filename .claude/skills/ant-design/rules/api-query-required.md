# 使用组件前必须查 API（硬约束）

**绝对不能凭训练数据猜 antd 组件 API。** antd 在 v5 → v6 周期内持续演进，方法签名、props、命名空间都在变。

## 必做步骤

1. **WebFetch 官方文档**：`https://ant.design/components/{component}-cn`
2. 或 **WebSearch** `"antd {component} API 2026"`
3. 确认：
   - props 与 type
   - 受控 / 非受控的字段名
   - 事件签名与参数
   - 是否被废弃（v6 移除项）
   - SSR 注意事项

## 例子

```bash
# 用 Button 前
WebFetch("https://ant.design/components/button-cn", "Button 的所有 props、size、type、loading 行为、icon 用法")

# 用 Form 前
WebFetch("https://ant.design/components/form-cn", "Form.Item rules、dependencies、shouldUpdate；Form.List 用法；validateFields 异常")

# 用 ConfigProvider 前
WebFetch("https://ant.design/components/config-provider-cn", "theme.token / theme.components / theme.algorithm")
```

## 为什么必须查

- v6 移除了不少 v4 时代的 props
- `destroyOnClose` → `destroyOnHidden` 等改名
- 部分组件 namespace 变（如 `Modal.confirm` 静态方法在 React 19 严格模式下行为有变）
- 主题 token 名经常调整

## 例外

仅当下面同时成立时可不查：
- 简单纯展示组件（如 Divider、Space）
- 没有用任何配置 props
- 不涉及主题或 SSR

否则一律查。
