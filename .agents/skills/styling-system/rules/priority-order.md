# 5 级优先级（硬约束）

按以下从高到低顺序选择方案，**禁止跳级**。

| # | 方案 | 何时 |
|---|---|---|
| 1 | **ConfigProvider** (`theme.token` / `theme.components`) | 全局或某类组件的所有实例 |
| 2 | **CSS Variables** (`--platform-*`、`data-theme`) | 主题切换、暗色模式、跨组件复用 |
| 3 | **组件 API props** (`style` / `styles` / `classNames`) | 单实例特殊化 |
| 4 | **className + Tailwind** | 快速布局/尺寸/间距、组件 API 不支持的属性 |
| 5 | **SCSS 覆盖** | 组件内部元素 / 伪元素 / 伪类，且必须注释覆盖原因 |

## 硬性禁止

- 直接覆盖 `.ant-*` 类名（除非走第 5 级 + `:global` + 注释）
- `!important`（除非覆盖第三方库的 `!important`，且必须注释）
- 硬编码颜色值（用 CSS Variables）
- 混用多种方案做同一件事

## 升级触发

| 信号 | 升级到 |
|---|---|
| 同样 `className` 在 3+ 处重复 | 第 1 级 ConfigProvider |
| 用 `data-theme` 切换三色 | 第 2 级 CSS Variables |
| `style={{ fontSize: 18 }}` 在多个 Input | 第 3 级 `styles` props，或第 1 级 components.Input |
| SCSS `:global(.ant-xxx)` 写得越来越多 | 检查是否第 3 级 API 已支持 |

## 检查

- [ ] 选了不能再低的级别
- [ ] 颜色用变量，无硬编码
- [ ] 没有 `!important`
- [ ] SCSS 覆盖处有注释说明
