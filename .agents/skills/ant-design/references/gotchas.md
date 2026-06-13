# Gotchas

## SSR / 样式

- **首屏 FOUC（先无样式闪一下）** → 缺 `AntdRegistry` / `StyleProvider`，见 `workflows/nextjs-ssr.md`
- **`cache` 每次渲染重建** → `createCache` 必须 `useMemo`
- **Tailwind preflight 与 antd 冲突** → preflight 重置 button/input 默认样式；可在 Tailwind 配置里关 preflight 或限定 selector
- **暗色模式切换闪一下** → 在主题切换时同步 toggle `algorithm`，并保持 cache 不被销毁

## 组件 props 改名（v5 → v6）

- `destroyOnClose` → `destroyOnHidden`（Modal/Drawer 等）
- `bodyStyle` → `styles.body`
- `dropdownClassName` → `popupClassName` 或 `classNames.popup`
- 详细差异以官方 v6 changelog 为准

## Table

- **没设 `rowKey` 警告** → `<Table rowKey="id">`；无 id 用 `rowKey={(record) => `${record.a}-${record.b}`}`
- **虚拟化下排序不工作** → `virtual` 模式需要固定 `scroll.y` 与稳定 `rowKey`
- **`pagination` 在 SSR 不出** → pagination 是 Client 渲染，不影响 SEO，正常

## Form

- **`form.validateFields()` 在 React 19 严格模式下报错** → 用 `App.useApp()` 获取的 message/modal/notification，避免静态方法
- **`shouldUpdate` 触发频繁** → 改用 `dependencies={['fieldA']}`
- **`Form.List` 性能差** → 大列表用 `<Form.List>` 内自渲染，外层不要 `shouldUpdate`

## Modal / Drawer

- **不用 `destroyOnHidden`** → 状态残留导致下次打开数据错乱
- **`Modal.confirm` 在 React 19 报警告** → 用 `App.useApp().modal.confirm()`

## Select / Tree

- **大数据卡顿** → `virtual`（默认开）+ `optionLabelProp`
- **远程搜索抖动** → 用 `debounce`，建议 200-300ms
- **Tree `checkStrictly` 与 `checkable` 行为反直觉** → checkStrictly 时父子互不影响

## Upload

- **进度不更新** → `customRequest` 中要手动调 `onProgress({ percent })`
- **文件预览 URL 失效** → `customRequest` 上传成功后赋 `file.url`，否则用 `file.thumbUrl`

## 性能

- **整页慢** → 大量 `<Tooltip>` / `<Popover>` 同时挂载会拖慢；按需 lazy
- **首屏 antd JS 大** → 用 `babel-plugin-import` 或 ES Module tree-shaking（v5+ 默认支持）
