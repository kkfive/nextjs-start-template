# apps/api 增量规则

业务在对应 route 内闭环；复杂纯逻辑可在 route 目录拆分，不预设 service/domain 层。`src/lib` 只放数据库、缓存或第三方 SDK 适配，middleware 只处理横切关注点。
