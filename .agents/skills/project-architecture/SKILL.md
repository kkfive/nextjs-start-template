---
name: project-architecture
description: 仅用于改变代码归属、模块拆分、跨层/跨包依赖边界或新建 app/package；普通页面和既定模板实现不触发。
primary: true
user-invocable: true
---

# Project Architecture

| 任务 | 导航 |
|---|---|
| 归属或依赖 | `references/architecture-overview.md` |
| 新模块目录 | `references/directory-structure.md` |
| 命名 | `references/naming-conventions.md` |
| 循环依赖、deep import、误归属 | `references/gotchas.md` |

只在用户明确改变边界时使用。决策基于真实消费者和现有实现；apps 独立，package 只承载已存在的跨 app 复用。具体文件写法、App Router 与工程工具分别交给对应 Skill。
