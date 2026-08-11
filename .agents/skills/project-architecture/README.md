# Project Architecture

用于用户明确提出的代码归属、模块拆分、新 app/package 与跨层或跨包依赖边界决策。
按现有 Feature-first 模板新增普通 page、feature 或 public entry 不触发 `/project-architecture`。
普通页面实现、单文件实现与 Turbo、CI 工程化不使用此入口。
入口与完整路由见 [SKILL.md](./SKILL.md)。
