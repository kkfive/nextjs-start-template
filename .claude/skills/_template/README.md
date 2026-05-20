# Skill 模板（基于 skill-based-architecture）

创建新 skill 时复制本目录到 `.claude/skills/<your-skill-name>/`，按 `SKILL.md` 顶部指引填写。

## 目录结构

```
<skill-name>/
├── SKILL.md              # 入口（≤ 90 行 body + ≤ 25 行 description）
├── routing.yaml          # 任务路由的单一源
├── README.md             # 人类可读概览（可选）
├── rules/                # 长期硬约束（"什么是真的"）
│   └── *.md
├── workflows/            # 步骤化流程（"怎么做"）
│   └── *.md
└── references/           # 深度查询资料（按需打开）
    ├── *.md
    └── gotchas.md        # 推荐：高价值踩坑
```

## 16 条原则（摘自 skill-based-architecture，用作自检）

1. **SKILL.md 双预算**：description ≤ 25 行 + body ≤ 90 行
2. **单一 skill 目录**：所有正式文档在 `skills/<name>/`，不在仓库根
3. **Rules ≠ Flows**：约束放 `rules/`，步骤放 `workflows/`
4. **routing.yaml 单一源**：SKILL.md 仅引用，不重复维护
5. **Cursor 入口（如需）**：本项目不用 Cursor → 跳过
6. **Progressive Rigor**：按真实压力升级，不预建脚手架
7. **description = 粗活化**：描述领域 + 触发短语，不是关键词堆
8. **Gotchas 高价值**：每个 skill 都有 `references/gotchas.md`
9. **Progressive Disclosure**：SKILL.md 一层链接到具体文件
10. **任务关闭协议**：改完代码做原始约束检查 + AAR
11. **泛化规则**：写下的知识能离开本项目仍有意义
12. **自维护**：行数超标先评估，再决定是否拆
13. **激活而非储存**：踩坑必须在路由路径上，不只在 references 里
14. **Token 效率**：always-load 控制在 2-3 条
15. **辩词表**：记录失败的真实借口，不是想象的
16. **响应纪律**：直接答，不流程旁白

## 双适配（Claude Code + Codex）

- **Claude Code**：自动扫描 `.claude/skills/*/SKILL.md` 的 frontmatter，可 `/skill-name` 调用
- **Codex CLI**：读 `AGENTS.md`；在 AGENTS.md 的 "Skill Index" 段列出本 skill 的入口路径
- **新增 skill 后**：必须同步更新 `AGENTS.md` 的 Skill Index

## 语言规范

- 主要语言：简体中文
- 技术术语：保留英文
- 代码注释：中文
- 变量名：英文
