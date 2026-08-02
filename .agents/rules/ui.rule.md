# UI Rule

基础控件来自 `@kkfive/ui`；antd 由各 app 自治。app 内封装必须提供真实加工，不建立纯 re-export；明显透传由 FFG04 校验。

业务 UI 留在 feature；`src/components/` 只放跨 feature 共享组合、provider 与 app 专属基础封装。是否提升为共享组件依据真实消费者，而非预期复用。

UI 证据关注可观察结果、可访问语义和交互状态；视觉、响应式与键盘路径按风险升级为真实浏览器验收。
