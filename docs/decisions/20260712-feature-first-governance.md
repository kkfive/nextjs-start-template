# ADR：Feature-first 架构治理冻结

- 状态：待 `architect-reviewer` 冻结
- 日期：2026-07-12
- 决策范围：`apps/*` 的前端业务目录、路由职责、运行时适配层，以及对应的静态治理门禁。

## 背景与不可变决策

前端业务代码曾分散在 `src/components`、`src/app`、`src/service` 和遗留 Domain 路径中，使路由、业务视图与运行时实例的归属不清。本 ADR 冻结为 **Feature-first**：业务能力按 feature 聚合在 `src/features`；路由只负责组合；`src/service` 只保留 HTTP、RPC、SSE 的运行时实例。

迁移采用一次性切换：在同一变更中更新所有 import、删除旧目录和失效 alias。禁止兼容层、re-export、旧 alias、双写目录或 Domain 迁移回退。后续任务只能执行此决策，不能用旧规则或 Wave 1 的临时观察重开目录设计。

## 目标目录与职责

```text
apps/client/src/
├── app/                                  # page.tsx、layout.tsx 与路由元数据；仅组合 feature 入口
├── features/
│   ├── home/components/
│   │   ├── home-page-client.tsx
│   │   └── hero-section.tsx
│   └── demo/
│       ├── navigation/{components,model/nav}/
│       ├── request/components/{request-playground,response-viewer}.tsx
│       ├── hitokoto/components/hitokoto-card.tsx
│       └── {rpc,forms,state,ui,pdf-viewer}/components/*-page.tsx
└── service/                              # 仅 http-*, rpc-* 与 index.sse 等运行时实例
```

- Feature 可以拥有 `components`、`model`、纯逻辑和 feature 内部测试；`demo/state` 的 `mouse-store` 随 feature 迁入其 `model`。
- `app/**/page.tsx` 和 `layout.tsx` 只能导入并组合 feature 入口、路由元数据与 Next.js 路由能力；不得定义可复用视图、业务状态、请求 call 或领域编排。
- `src/service` 只创建并隔离 HTTP/RPC/SSE 运行时实例。浏览器与服务端实例继续用 `client-only` / `server-only` 物理隔离；业务 calls、hooks、页面模型和 UI 不得留在此层。
- `packages/* → apps/*` 的运行时依赖、`apps/* → apps/*` 的依赖、以及 `internal/* → apps|packages` 的依赖均禁止。唯一例外是 `packages/rpc` 对 `apps/api` 的 `AppType` 使用 `import type`，不得形成运行时 import。

## 一次性删除清单

下列项目是删除目标，不是允许保留的兼容路径：

| 删除目标 | 一次性替代与完成条件 |
| --- | --- |
| `components/home`、`components/demo` | 全部视图已迁入对应 `src/features/home` 或 `src/features/demo`，旧目录物理删除。 |
| `config/demo-nav.tsx`、`config/site-features.tsx`、`components/home/feature-card.tsx` | 导航模型已归入 `features/demo/navigation/model/nav`；未引用死代码直接删除。 |
| `components/**/domain`，包括 `components/demo/domain/request/scenario-card.tsx` | 领域子目录与死组件删除；不得在 feature 下重建 `domain` 兼容目录。 |
| `domain-core` 与所有 `@kkfive/domain-core` 引用 | 已废弃包/说明与引用全部删除；不得恢复共享业务 Domain 包。 |
| `@domain` 与所有旧 alias 配置或 import | 改为明确的 feature 内相对入口或 app 的 `@/features/*`；alias 定义与引用同时删除。 |
| `service/hitokoto` 及任何按业务名分组的 `src/service/<feature>` | 业务请求逻辑迁入 `src/features/<feature>`；service 仅留下运行时 HTTP/RPC/SSE 实例。 |

删除完成的判定是旧路径、alias、re-export 与 import 全部不存在。不得以 deprecated 注释、转发文件、barrel 透传或保留空目录替代删除。

## AST 规则矩阵

迁移实现必须把下表落实为基于 TypeScript AST 的规则 registry；解析范围包括静态 import/export、`import()` 与 `package.json` 依赖。每条规则都要有同名 `valid` / `invalid` fixture，Vitest 断言 `ruleId`、文件、行号和非零退出码；正例不得报告问题，反例必须唯一命中对应 ruleId。

| ruleId | 审核规则 | valid fixture | invalid fixture |
| --- | --- | --- | --- |
| `FFG01` | 业务模块位于 `apps/*/src/features/<feature>`；删除清单中的旧业务目录不可出现。 | `features/demo/request/components/response-viewer.tsx` | `components/demo/request/response-viewer.tsx` |
| `FFG02` | `app/**/{page,layout}.tsx` 只做路由组合，不定义可复用组件、业务状态、请求 call 或 feature 业务实现。 | `app/demo/request/basic/page.tsx` 组合 `@/features/demo/request` 入口 | `app/demo/request/basic/page.tsx` 内定义 `RequestPlayground` 或 `fetch()` |
| `FFG03` | `src/service` 只允许 HTTP/RPC/SSE 运行时实例和边界标记；不得放业务 call、hook、组件、store 或 feature 模型。 | `service/rpc-client.ts` 含 `client-only` 与 `createRpcClient` | `service/hitokoto/calls.ts` 或 `service/demo/hooks.ts` |
| `FFG04` | 禁止兼容层、re-export 透传、旧 alias 和回退导入；删除目标不能被重新创建或引用。 | `@/features/home/components/hero-section` | `export * from '@/features/home'` 或 `@domain/home` |
| `FFG05` | monorepo 依赖单向：packages/internal 不依赖 apps，apps 互不依赖。 | `apps/client` import `@kkfive/rpc` | `packages/ui` import `apps/client/src/features/home` |
| `FFG06` | RPC 对 API 的唯一豁免只能是 `packages/rpc` 对 `apps/api` 的 `AppType` type-only import。 | `import type { AppType } from '../../../apps/api/src/app'` | `import { app } from '../../../apps/api/src/app'` |
| `FFG07` | `apps/api` 的 `no-restricted-imports` 禁令必须启用且不可通过 override、disable 注释或删配置关闭。 | API 文件不含受限前端/DOM import，规则配置保持启用 | API 文件使用受限 import，或 ESLint 配置设置 `no-restricted-imports: off` |

当前逐行 regex 校验不足以满足此矩阵；它只能作为迁移前基线，不能被标为 AST 门禁已完成。

## 命令边界与验收证据

| 命令 | 责任 | 不可替代的证据 |
| --- | --- | --- |
| `pnpm verify` | 静态治理聚合入口：lint、typecheck、依赖一致性、architecture policy 与 policy fixture。它绝不执行 application `pnpm test:run` 或 `pnpm build`。 | 只证明已完成这些静态治理检查；绿色结果不证明测试运行或生产构建。 |
| `pnpm test:run` | 执行仓库测试与 AST `valid` / `invalid` fixture 测试。 | 变更验收必须单独记录该命令的成功退出状态。 |
| `pnpm build` | 执行所有 app/package 的生产构建，暴露路由、类型、打包和 server/client 边界问题。 | 变更验收必须单独记录该命令的成功退出状态。 |

因此，`pnpm verify` 不替代、也不包含 `pnpm test:run` 或 `pnpm build`。三条命令必须分别运行，并在 CI、合并记录和架构审核中分别保留明确证据。

## 架构审核关口

以下恰好三个关口由 `architect-reviewer` 审核；未通过不得推进后续波次。

| 关口 | 冻结输入 | 通过条件 |
| --- | --- | --- |
| W0 | 本 ADR、目录映射、删除清单和 AST 规则矩阵 | 确认 Feature-first 归属、一次性删除和 service/route 边界没有兼容回退。 |
| W2 | 完成迁移后的 import 图、AST fixture 与删除结果 | 确认旧路径/alias 为零、路由只组合、service 只有运行时实例，且依赖方向和 RPC type-only 例外合规。 |
| W3 | 独立环境的治理、测试、构建和干净 agent 日志 | 确认 `pnpm verify`、`pnpm test:run`、`pnpm build` 均有独立成功证据，AI 规范未再引导到旧架构。 |

## 后果

本决策提高首次迁移的改动面，但让每个 feature 的入口、删除时机和机器检查标准唯一可判定。若未来需要调整目录或规则，必须以新的 ADR 显式 supersede 本 ADR；不得在实施任务中添加临时兼容方案。
