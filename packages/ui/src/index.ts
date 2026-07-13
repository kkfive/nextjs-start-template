/**
 * @kkfive/ui —— 基础 UI 组件（shadcn 二次封装 + 自实现基础组件）。
 *
 * 不含 antd（antd 由各 app 按需自行安装）。
 * React 作为 peer dependency，不打包进产物。
 * 各 app 通过 @kkfive/ui 引入基础控件。
 */

// 组件 re-export
export * from './components/button'

export * from './components/card'
export * from './components/drawer'
export * from './components/input'
export * from './components/method-badge'
export * from './components/scroll-area'
export * from './components/separator'
export * from './components/sheet'
export * from './components/sidebar'
export * from './components/skeleton'
export * from './components/status-badge'
export * from './components/tooltip'
// utils
export { cn, cva, type VariantProps } from './utils/cn'
