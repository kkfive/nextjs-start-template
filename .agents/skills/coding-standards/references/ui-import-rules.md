# UI 组件消费规范

**核心原则**：基础 UI 控件直接来自 `@kkfive/ui/components/*` 或 antd，业务代码直接消费。透传 re-export 由 FFG04 机器拦截，此处不再展开。

## antd 使用（项目决定）

`@kkfive/ui` 不含 antd。antd 由各 app 按需安装，业务代码**可直接 `from 'antd'`**——antd 是 app 的合法 UI 依赖，不做二次封装。

- 用 antd 独有能力（Form/Table/Upload）时直接 import
- 基础控件优先 `@kkfive/ui/components/*`，减少与 antd 重复
- ConfigProvider / 主题 token 各 app 自治

## 何时在 app 内封装

仅当存在**真实加工**（改默认 props、限制 API、注入主题、组合控件）时才封装，封装必须含实现：

```typescript
// ✅ 合法封装：含实现，改了默认行为
import { Button as UiButton } from '@kkfive/ui/components/button'
export function PageButton(props) {
  return <UiButton variant="default" size="lg" {...props} />
}
```

## 放置

- 跨 feature 通用 UI：`apps/{app}/src/components/`（不依赖特定业务）
- feature 专属业务 UI：`apps/{app}/src/features/<feature>/components/`（可连 feature calls）
