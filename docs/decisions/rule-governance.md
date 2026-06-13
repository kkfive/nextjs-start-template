# 规则治理决策

## 背景

项目规范同时存在于 `AGENTS.md`、`docs/`、`.agents/skills/` 和校验脚本中。随着示例和规则演进，这些位置容易出现描述不一致，例如 Controller 形态、Domain 是否完全框架无关、客户端应注入哪个 HTTP 实例等。

## 决策

项目规范采用“原则源 + 按需解释 + 机器门禁”的治理方式。

`.agents/rules/` 是高频原则源，面向人和 agent。它描述稳定原则，不维护长枚举。`docs/` 解释背景、取舍和示例，不复制完整规则。`.agents/skills/` 提供任务流程，并引用适用规则。`scripts/verify-conventions.mjs` 承接可枚举、可自动检查的细则。

Controller 采用当前代码和校验脚本一致的形态：`controller.ts` 导出命名函数，模块入口通过 `export * as Controller from './controller'` 暴露稳定公共 API。

`domain/hooks.ts` 短期保留为运行环境适配层例外。Domain 核心逻辑仍应框架无关；Hooks 可以使用 React Query，但只应调用 Domain 公共入口并注入客户端 HTTP 实例。

## 后果

新增或修改规范时，先判断它是原则还是枚举。原则进入 `.agents/rules/`，解释进入 `docs/`，可检查枚举进入校验脚本。其他文件引用规则源，不重复铺开同一规则。

文档示例必须跟机器门禁一致。若示例需要展示反模式，应明确标记为反模式，避免被当成推荐写法。
