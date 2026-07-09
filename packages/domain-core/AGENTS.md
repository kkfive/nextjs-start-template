# packages/domain-core 协作准则（领域核心逻辑共享包）

`@kkfive/domain-core` 存放框架无关的业务纯逻辑：Service（数据获取）、Controller（编排与归一化）、Type、Const。不含 HTTP 实例、不含 React/Next/Hono 依赖。

继承根 `AGENTS.md` 全部规则，补充本包专属约束。与根级冲突时以本文件为准（但不违反根级硬性约束）。

<always-applicable>

## 关键约束

### 框架无关（硬约束）

- **禁止** import React / Next.js / Hono / 任何 HTTP 框架 API
- **禁止** import 任何 `apps/*`
- HTTP 实例由调用方注入（Service/Controller 第一参为 `HttpService`），本包不自建实例
- `@kkfive/http-client` 仅作 `peerDependencies`（类型与注入，不含运行时创建）

### Controller 形态

- `controller.ts` 导出命名函数（非 class），第一参类型为 `HttpService`
- 模块入口通过 `export * as Controller from './controller'` 暴露稳定公共 API
- 外部响应不可信，Controller 归一化为内部类型（`ExternalData<T>` 表达）

### 测试归属

- 测共享包纯逻辑的测试 **放在本包源文件同目录**（`src/<module>/*.test.ts`），不放各 app 适配层
- MSW mock 放 `src/__tests__/mocks/`，handler 覆盖本包模块的 HTTP 调用
- vitest 配置用 `environment: 'node'`（无需 jsdom）

### 模块结构

每个业务模块至少含：`type.ts`、`const/api.ts`、`service.ts`、`controller.ts`、`index.ts`。模块入口 `index.ts` re-export Controller（`export * as Controller`）+ service + type + const。

</always-applicable>

<task-routing>

## 目录结构

```
packages/domain-core/
├── src/
│   ├── __tests__/mocks/    # MSW handler + server（测试用）
│   ├── example/
│   │   ├── hitokoto/       # {type,const,service,controller,index}.ts + service.test.ts
│   │   └── request/        # 同上 + controller.test.ts
│   └── index.ts            # 包入口
├── vitest.config.ts        # environment: 'node'
└── package.json            # peerDependencies: @kkfive/http-client
```

Skill 的 meta 由工具自动注入。

## 参考

- 根级规范：`../../AGENTS.md`

</task-routing>
