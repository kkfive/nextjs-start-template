# apps/admin 协作准则（管理后台示例 Next.js SSR）

`apps/admin` 是管理后台示例（Next.js App Router），以 SSR 直取为主。当前为 template 示例，演示 Next.js SSR 消费 `@kkfive/domain-core`。

继承根 `AGENTS.md` 全部规则，补充本 app 专属约束。与根级冲突时以本文件为准（但不违反根级硬性约束）。

<always-applicable>

## Always Load（继承 + 补充）

@.agents/rules/core.rule.md
@.agents/rules/monorepo.rule.md
@.agents/rules/domain.rule.md
@.agents/rules/ui.rule.md
@.agents/rules/next-app.rule.md

## 关键约束

### SSR 直取为主

- 页面（`src/app/`）默认 Server Component，使用已注入的 `serverClient`（来自 `src/service/index.server.ts`）发起请求
- **不内联 `new HttpService()`**——使用 `@/service/index.server` 导出的 `serverClient` 实例
- 业务编排（try/catch、降级）应下沉到 domain 适配层，页面只做组合与渲染

### Domain 适配层（SSR 模式，无 React Query）

- `domain/` re-export `@kkfive/domain-core` 纯逻辑，按模块组织（`domain/<module>/`）
- 暂无 React Query hooks（SSR 直取场景不需要）
- Controller 调用时注入 `serverClient`，Domain 不自建实例

### 当前为示例阶段

- 结构最小化：仅 `src/app/` + `src/service/` + `domain/`
- `src/components/`、`src/lib/`、`src/hooks/` 待真实需求出现再建，不为示例写凑数空目录
- 暂未接入 tailwindcss（eslint 配置已 `tailwind: false` 跳过插件）

</always-applicable>

<task-routing>

## 目录结构

```
apps/admin/
├── domain/example/      # 适配层（re-export domain-core，SSR 编排）
├── src/
│   ├── app/             # 路由 / 页面（Server Component）
│   └── service/         # serverClient 注入（HttpService 实例）
├── next.config.ts       # withRepoConfig + transpilePackages
└── tsconfig.json        # extends @kkfive/tsconfig/nextjs.json
```

## 适用 Skill（admin 是 Next.js SSR app，技术栈与 client 相同）

| Skill | 位置 | 何时用 |
|---|---|---|
| nextjs-app-router | `../../.agents/skills/nextjs-app-router/SKILL.md` | 新建页面/API 路由/Server Action |
| domain-layer | `../../.agents/skills/domain-layer/SKILL.md` | 新建 Domain 适配层 |
| styling-system | `../../.agents/skills/styling-system/SKILL.md` | 调样式/主题（admin 接入 tailwind 后） |
| coding-standards | `../../.agents/skills/coding-standards/SKILL.md` | 文件级编码规范 |

## 参考

- 根级规范：`../../AGENTS.md`
- 重构决策：`docs/decisions/monorepo-restructuring.md`

</task-routing>
