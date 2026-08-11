# UI 组件导入规范

**核心原则**：基础 UI 控件来自 `@kkfive/ui`，业务代码**直接消费**，不做零价值 re-export 透传层。仅真实加工才封装，且封装必须含实现。

## 包结构

```
packages/ui/                     基础 UI（shadcn 二次封装 + 自实现，不含 antd）
  components/                     Button、Input、Dialog、Select 等
  hooks/                          use-mobile 等基础 hook
  utils/                          cn()、createIcon 等

apps/{app}/src/components/        跨 feature UI（直接消费 @kkfive/ui，无透传层）
  common/                         通用功能组件（可复用，不依赖特定业务）
apps/{app}/src/features/<feature>/components/
                                  feature 专属业务 UI（可连 feature calls）
```

## 导入规则（Next.js apps）

| 层级 | 导入规则 | 示例 |
|------|----------|------|
| `src/app/` | ✅ 直接 `@kkfive/ui/components/*` | `import { Button } from '@kkfive/ui/components/button'` |
| `src/components/common/` | ✅ 直接 `@kkfive/ui/components/*` / `hooks/*` | `import { useIsMobile } from '@kkfive/ui/hooks/use-mobile'` |
| `src/features/<feature>/components/` | ✅ 直接 `@kkfive/ui/components/*` + feature calls | — |
| 任何层 | ❌ 禁零价值透传层 | ~~`apps/{app}/src/components/ui/button.tsx` = `export * from '@kkfive/ui/...'`~~ |

## antd 使用

`@kkfive/ui` 不含 antd。antd 由各 app 按需安装，业务代码**可直接 `from 'antd'`**——antd 是 app 的合法 UI 依赖，不做二次封装（封装若无加工即零价值间接层，徒增 AI 理解与维护成本）。

- 用 antd 独有能力（Form/Table/Upload，或 antd Button 的 `variant`/`icon` API）时直接 import
- 基础控件优先 `@kkfive/ui/components/*`，减少与 antd 重复
- ConfigProvider / 主题 token 各 app 自治

## 何时在 app 内封装

仅当存在**真实加工**时才封装，封装必须含实现（非纯 re-export）：

```typescript
// ✅ 合法封装：含实现，改了默认行为
import { Button as UiButton } from '@kkfive/ui/components/button'
export function PageButton(props) {
  return <UiButton variant="default" size="lg" {...props} />
}

// ❌ 非法：零价值透传，直接用 @kkfive/ui 即可
export { Button } from '@kkfive/ui/components/button'
```
