# Create App Skill

新建应用规范 - workspace 注册、继承 internal 配置、transpilePackages、app 内部分层、HttpService 注入。

## 使用场景

- 在 `apps/` 下新建 Next.js 应用（client / admin）
- 在 `apps/` 下新建 Hono 应用（api）
- 接入 `@kkfive/*` 共享包
- 配置应用基础设施（HTTP 实例、tsconfig、eslint）

## 调用方式

```
/create-app
```

## 核心原则

- **app 之间不互引**：共享内容提取为 package
- **继承 internal 配置**：tsconfig / eslint / next.config / tailwind 都继承预设
- **transpilePackages**：Next.js app 消费的每个 `@kkfive/*` 都要加进 `transpilePackages`
- **Feature-first**：业务视图、calls、hooks、状态和模型在 app 的 `src/features/`；`src/service/` 仅保存 HTTP/hc/SSE 双实例

## References

- `workflows/new-app.md` - 新建应用完整流程
- `references/app-anatomy.md` - app 结构与配置继承详解
- `references/gotchas.md` - 踩坑速查
