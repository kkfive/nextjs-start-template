# apps/admin 协作准则（管理后台示例 Next.js SSR）

`apps/admin` 是管理后台示例（Next.js App Router），以 SSR 直取为主。它以 Feature-first 目录演示 SSR 页面组合。

继承根 `AGENTS.md` 全部规则，补充本 app 专属约束。与根级冲突时以根级硬性约束为准。

<always-applicable>

## 关键约束

### SSR 与 Feature-first

- 页面（`src/app/`）默认 Server Component，只组合 feature 入口、路由元数据与渲染骨架
- 业务编排、数据获取、视图和页面模型归属 `src/features/<feature>/`；SSR 首屏数据由所属 feature 的 server 逻辑获取
- 不内联 `new HttpService()`；server-side feature 只使用 `src/service/http-server.ts` 或 `rpc-server.ts` 导出的实例

### 运行时实例

- `src/service/` 只存 HTTP、RPC、SSE 运行时实例；不得建立业务名子目录
- 服务端实例必须由 `server-only` 物理隔离；客户端实例如未来需要，必须由 `client-only` 隔离

### 当前为示例阶段

- 结构保持最小：按真实需求建立 `src/features/`，不为示例创建空目录
- 跨 feature 可复用 UI 才进入 `src/components/`；`src/lib/` 仅放 app 级基础设施
- 暂未接入 tailwindcss（eslint 配置已 `tailwind: false` 跳过插件）

</always-applicable>

<task-routing>

## 目录结构

```text
apps/admin/
├── src/
│   ├── app/             # 路由 / 页面（Server Component，仅组合）
│   ├── features/        # SSR feature 视图、calls、模型
│   └── service/         # HTTP / RPC 运行时实例
├── next.config.ts       # withRepoConfig + transpilePackages
└── tsconfig.json        # extends @kkfive/tsconfig/nextjs.json
```

Skill 的 meta 由工具自动注入，按 description 匹配按需打开。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
