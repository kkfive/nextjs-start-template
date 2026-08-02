---
name: evidence-first-development
description: 新功能、bug、契约、重构或工程行为变化的证据流程；纯文档、注释和格式化不触发。
user-invocable: true
---

# Evidence-First Development

本 Skill 是行为变更流程的唯一 owner。

| 任务 | 导航 |
|---|---|
| 新功能或行为重构 | `workflows/behavior-change.md` |
| bug 修复 | `workflows/bug-fix.md` |
| CI、构建、架构、视觉或性能 | `workflows/non-test-evidence.md` |
| 选择证据 | `references/evidence-matrix.md` |
| 影响与回归 | `references/impact-and-regression.md` |
| 验收与报告 | `references/acceptance-and-reporting.md` |

实现前固定目标、非目标、影响、验收和证据；取得因目标行为缺失而失败的 RED 或可重复等价证据。GREEN 后按风险扩展到消费者、全局门禁及必要的 build/E2E；高风险由独立主体验收。不得用环境错误、AI 自述、时间顺序或弱化断言伪造证据。
