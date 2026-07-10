/**
 * @kkfive/utils/dom —— 浏览器交互工具（仅浏览器端可引用）。
 *
 * 红线：此处导出允许使用 document / window / localStorage 等浏览器全局变量。
 * 服务端（apps/api、Edge 运行时）**禁止**引用本子路径——从机制上断绝
 * 边缘端解析浏览器全局变量导致的崩溃。服务端请用 @kkfive/utils/common。
 *
 * 当前为占位：待首个浏览器交互工具（如 copyToClipboard）落地后在此导出。
 */
export {}
