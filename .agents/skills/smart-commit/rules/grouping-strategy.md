# 文件分组策略

按以下优先级把暂存区文件切成多个 commit。

## 优先级（从高到低）

1. **配置文件独立**：`*.config.*`、`.gitignore`、`tsconfig.json`、`.eslintrc.*`、`commitlint.config.*` 单独 commit
2. **文档独立**：`docs/**`、`README*`、根目录 `*.md`（除非与代码强相关）
3. **Skills 独立**：`.agents/skills/**` 按 skill 分组
4. **样式独立**：仅 `*.css|scss|sass|less|tailwind.config.*` 的变更
5. **测试与被测代码同 commit**：`*.test.*`、`*.spec.*` 与源代码合并
6. **功能内聚合并**：同一业务能力的 Domain + UI + Page 合并
7. **删除操作独立**：大量删除、清理示例等单独 commit
8. **依赖 / 锁文件**：`package.json` 与 lockfile 同 commit

## 切分维度速查

| 维度 | 切分理由 |
|---|---|
| 路径所属层（domain / components / app） | 跨层混合时切；同一功能可合 |
| 变更类型（A/M/D/R） | 大量 D 单独切 |
| 业务能力（auth / material / dashboard） | 不同能力切 |
| 配置 vs 代码 | 必切 |
| 文档 vs 代码 | 通常切，除非文档解释当次变更 |

## 模块化路径速查

| 路径 | 归属 |
|---|---|
| `domain/<module>/**` | Domain 层 |
| `src/components/ui/**` | 通用 UI |
| `src/components/<domain>/**` | 业务 UI |
| `src/app/**` | 路由 / 页面 |
| `src/lib/**`、`src/service/**` | 基础设施 |
| `.agents/skills/<skill>/**` | Skill |
| `docs/**` | 文档 |

## 示例

输入暂存区：
```
domain/auth/index.ts                 (A)
domain/auth/schema.ts                (A)
src/app/(auth)/login/page.tsx        (A)
src/components/ui/form/index.tsx     (M)
docs/architecture.md                 (M)
.gitignore                           (M)
domain/example/**                    (D × 15)
```

输出 5 个 commit：
1. `feat: 新增认证模块`（domain/auth + login page + ui/form）
2. 或拆为 `feat: 新增认证 Domain` + `feat: 新增登录页`（如果两者改动量大）
3. `docs: 更新架构文档`
4. `chore: 更新 gitignore`
5. `chore: 删除示例代码`

合并/拆分尺度：单 commit 改动文件数最好在 1–8 之间；超过即考虑再切。
