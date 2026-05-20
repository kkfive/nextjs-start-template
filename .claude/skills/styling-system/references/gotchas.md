# Gotchas

## 跨级常见错误

| 反模式 | 问题 | 升级到 |
|---|---|---|
| 覆盖 `.ant-btn` 全局类 | 升级 antd 后失效 | Level 1 ConfigProvider |
| `!important` | 破坏优先级 | 提高选择器权重 / Level 1-2 |
| 硬编码颜色 | 主题切换不响应 | Level 2 CSS Variables |
| 内联 `style` 复杂布局 | 无法复用、响应式难写 | Level 4 Tailwind |
| 多个 Input 重复 `style` | 维护负担 | Level 1 components.Input |
| 全局 SCSS 没作用域 | 污染其他实例 | 加 wrapper class |
| SCSS 覆盖无注释 | 后人不知道为什么 | 必须加注释 |

## 常见问题

### Q1: ConfigProvider 还是 CSS Variables？
- ConfigProvider：antd 组件、要 TS 类型、设计系统基础
- CSS Variables：主题切换、暗色、跨组件复用、非 antd 组件

### Q2: 组件 API 不支持某个属性怎么办？
1. 查最新 antd 文档（API 在演进）
2. 若不支持 → Level 4 Tailwind
3. 若 Tailwind 写不出 → Level 5 SCSS（加注释）

### Q3: 如何避免覆盖失效？
- 优先组件 API
- 颜色用 Variables
- 不用 `!important`
- 选择器作用域到组件根

### Q4: 第三方非 antd 组件怎么办？
1. 查它有没有 `className` / `style` props
2. 没有 → Level 5 SCSS
3. 颜色用 Variables 保持主题一致

### Q5: 什么时候可以用 `!important`？
**几乎不该用**。唯一例外：覆盖第三方库自己的 `!important`，且必须注释。

## SSR / Next.js 相关

- 首屏 FOUC 见 `/ant-design` `workflows/nextjs-ssr.md`
- Tailwind preflight 与 antd 默认样式可能冲突 → 在 `tailwind.config` 关 preflight 或限定 selector
- 暗色切换时 antd `algorithm` 与 CSS Variables 要同步切换

## 调试

- 浏览器 DevTools：Computed → 看实际生效的 cascade
- 检查 antd token：DevTools 中 `cssinjs` 注入的 `<style id="antd">`
- 想确认是哪个文件覆盖：Source Map 应启用（已默认）
