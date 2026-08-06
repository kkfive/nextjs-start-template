# Next App Rule

`src/app` 只组合路由与 runtime 入口，业务实现留在 feature。

Route Handler 只承担 app 内 BFF、聚合或转发；独立后端能力进入 `apps/api`。首屏读取、客户端查询与写入后的缓存状态必须一致。
