# Gotchas

## 跨级常见错误

| 反模式 | 问题 | 升级到 |
|---|---|---|
| 覆盖 `.ant-btn` 全局类 | 升级 antd 后失效 | Level 1 ConfigProvider |
| `!important` | 破坏优先级 | Level 1-2 |
| 硬编码颜色 | 主题切换不响应 | Level 2 CSS Variables |
| 内联 `style` 复杂布局 | 无法复用、响应式难写 | Level 4 Tailwind |
| 全局 SCSS 没作用域 | 污染其他实例 | 加 wrapper class |

## SSR / Next.js

- 首屏 FOUC 按当前 antd SSR 官方指南核对，并检查 app 的 provider 实现
- Tailwind preflight 与 antd 默认样式可能冲突 → 从 Tailwind v4 入口 `apps/client/src/styles/tailwind.css` 调整 CSS layer；共享 PostCSS 能力统一由 `internal/tailwind-config` 提供
- 暗色切换时 antd `algorithm` 与 CSS Variables 要同步切换

## 调试

- DevTools Computed 看实际生效的 cascade；`cssinjs` 注入的 `<style id="antd">` 看 token；确认覆盖来源用 Source Map
