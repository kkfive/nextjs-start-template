# 包级 Skill 物理隔离方案(最终版)

## 一、技术现实(已充分验证)

| 工具 | 子包 `.agents/skills/` 发现 | 机制 |
|---|---|---|
| **ZCode**(主力) | ✅ | CWD→repo root 向上逐级扫描 `.agents/skills/` |
| **Codex CLI** | ✅ | CWD→repo root 向上扫描 `.agents/skills/`(官方文档确认) |
| **Claude Code** | ⚠️ 手动 | 不自动发现 `.agents/skills/`(issue #31005),但读 CLAUDE.md/子包 AGENTS.md 的 Skill Index 表,按路径引用打开 SKILL.md |

**策略**:`.agents/` 单一源,无 symlink、无 .claude/skills/。Claude Code 靠 AGENTS.md/CLAUDE.md 的 Skill Index 表路径引用发现 skill(物理位置不影响)。

## 二、Skill 归属分析

13 个 skill 按作用域分三类:

**全局/跨包共享(11 个,留根 `.agents/skills/`)**:
- project-architecture(primary)、coding-standards、smart-commit、searches-iconify
- create-app、create-package(触发时跨包操作)
- domain-layer(跨 client+admin+api+domain-core 四个包)
- nextjs-app-router(跨 client+admin 两个 app)
- motion、styling-system(前端 app 共享)
- _template(模板)

**单包专属(2 个,下沉)**:
- **hono-api** → `apps/api/.agents/skills/`(仅 api 用 Hono)
- **ant-design** → `apps/client/.agents/skills/`(当前仅 client 用 antd)

## 三、执行步骤(1 个 commit)

### 步骤 1:迁移 hono-api
- `git mv .agents/skills/hono-api apps/api/.agents/skills/hono-api`(保留 git 历史)
- SKILL.md description 补作用域:"仅在 apps/api 包内使用"
- apps/api/AGENTS.md task-routing 补本地 skill 引用

### 步骤 2:迁移 ant-design
- `git mv .agents/skills/ant-design apps/client/.agents/skills/ant-design`
- SKILL.md description 补作用域:"仅在用 antd 的 app(当前仅 client)内使用"
- apps/client/AGENTS.md task-routing 补本地 skill 引用

### 步骤 3:更新根 AGENTS.md + CLAUDE.md
- Skill Index 表移除 hono-api 和 ant-design 行
- 表底加注释:hono-api/ant-design 已下沉到各自包,编辑对应包时自动发现(ZCode/Codex)或读子包 AGENTS.md(Claude Code)

### 步骤 4:verify-conventions.mjs G05 适配
扫描路径增加子包:
```js
const routingFiles = [
  ...globSync('.agents/skills/**/routing.yaml', ROOT),
  ...globSync('apps/*/.agents/skills/**/routing.yaml', ROOT),
  ...globSync('packages/*/.agents/skills/**/routing.yaml', ROOT),
]
```

### 步骤 5:create-app/create-package workflow 更新
补充"技术栈专属 skill 下沉"指引。

### 步骤 6:_template/SKILL.md 更新
补充"包级 skill 放置指引":
- 单包专属 → `<包>/.agents/skills/<name>/`
- 多包共享 → 根 `.agents/skills/`
- description 写明作用域

### 步骤 7:全量校验 + 提交
`pnpm run verify` + `pnpm test:run` + `pnpm run lint` → 1 个 commit:
`refactor: 包级 skill 物理隔离(hono-api→apps/api, ant-design→apps/client)`

## 四、不做的事

- 不建 .claude/skills/(symlink 不工作,Claude Code 靠路径引用)
- 不建 .codex/skills/(Codex 原生读 .agents/skills/)
- 不迁移 11 个共享 skill(留根最优)
- 不为简单包建 skills 目录