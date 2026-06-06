# Commit Type 推断

根据文件路径 + 变更类型从 commitlint `type-enum` 中选 type。

## 推断优先级（自顶向下，命中即停）

| 匹配 | type |
|---|---|
| `*.config.*` / `.gitignore` / `tsconfig.json` / `package.json` 等 | `config`（或 `chore`/`build`，看 `type-enum`） |
| `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` | `build` |
| `docs/**` / `*.md` / `README*` | `docs` |
| `*.test.*` / `*.spec.*` / `**/__tests__/**` | `test` |
| `*.css/scss/sass/less` / `src/styles/**` / `tailwind.config.*` | `style` |
| 仅 `*.md` 在 `.agents/skills/<skill>/`（人类文档） | `docs` |
| `.agents/skills/**` 主要为 SKILL.md / routing.yaml / rules / workflows | `chore`（或单列 `skills`，若 `type-enum` 支持） |
| `domain/**` 新增 `index.ts` / `type.ts` / `service.ts` 整模块 | `feat` |
| `src/app/**` 新增 `page.tsx` | `feat` |
| `src/components/**` 新增并被使用 | `feat` |
| 大量 D（删除）且无新增 | `chore` |
| 文件名/diff 含 `fix` / `bug` | `fix` |
| 仅重组目录、改名、相同行为 | `refactor` |
| 含 `perf` / `benchmark` 路径或 diff 大幅 hot path 改 | `perf` |
| 其他 | 默认取 `type-enum` 中存在的最贴近，否则 `chore` |

## Subject 起草模式

| 场景 | 模式 | 示例 |
|---|---|---|
| 新增模块 | `新增<模块名>模块` | `feat: 新增认证模块` |
| 新增页面 | `新增<功能>页` | `feat: 新增素材列表页` |
| 改进现有 | `优化/改进<对象>` | `feat: 优化登录跳转逻辑` |
| 修复 | `修复<现象>` | `fix: 修复登录态丢失` |
| 重构 | `重构<对象>` | `refactor: 重构素材 Controller` |
| 文档 | `更新/补充<文档名>` | `docs: 补充架构说明` |
| 配置 | `更新<配置项>` | `chore: 更新 gitignore` |
| 清理 | `清理/删除<对象>` | `chore: 清理示例代码` |

Subject 必须 ≤ commitlint `subject-max-length`（默认 50）；超长则改用更短动词或拆 commit。

## 验证

推断完成后，对每个候选 type 做：
```js
if (!allowedTypes.includes(candidateType)) {
  // 退回到 allowedTypes[0] 或更安全的 'chore'
}
```
