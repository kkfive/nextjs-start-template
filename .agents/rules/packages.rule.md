# Packages Rule

package 只承载边界清晰的跨 app 能力，并通过稳定 `exports` 暴露。

公共 export、schema、error envelope、RPC/HTTP 或基础 UI 契约变化必须验证受影响的直接消费者。
