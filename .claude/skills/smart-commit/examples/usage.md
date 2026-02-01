# Smart Commit 使用示例

## 基本使用流程

### 1. 准备暂存区

```bash
# 添加所有变更文件
git add .

# 或选择性添加
git add domain/ src/components/ docs/
```

### 2. 调用 skill

```bash
/smart-commit
```

### 3. 查看 Commit Plan

Skill 会自动分析并生成 commit plan：

```markdown
## Commit Plan

**Commitlint 配置**: commitlint.config.js
**允许的类型**: feat, improvement, fix, refactor, docs, test, config, style, perf, ci, build, revert, chore, type, WIP
**Subject 最大长度**: 50 字符
**Header 最大长度**: 72 字符

---

### Commit 1: feat: 新增认证模块
**类型推断**: feat (新增 Domain 模块)
**文件** (3):
- domain/auth/index.ts
- domain/auth/schema.ts
- domain/auth/type.d.ts

**说明**: 实现用户认证的 Domain 层逻辑

---

### Commit 2: config: 更新 ESLint 配置
**类型推断**: config (配置文件)
**文件** (1):
- eslint.config.js

**说明**: 添加新的 lint 规则

---

### Commit 3: docs: 更新架构文档
**类型推断**: docs (文档文件)
**文件** (2):
- docs/architecture.md
- CLAUDE.md

**说明**: 补充认证模块的架构说明
```

### 4. 确认并执行

- 审查 commit plan
- 确认分组合理性
- 确认 commit message 符合规范
- 执行提交

### 5. 查看结果

```bash
✓ Commit 1/3: feat: 新增认证模块 [abc1234]
✓ Commit 2/3: config: 更新 ESLint 配置 [def5678]
✓ Commit 3/3: docs: 更新架构文档 [ghi9012]

总计: 3 个 commit，涉及 6 个文件
```

## 实际案例

### 案例 1: 新功能开发

**场景**: 开发了用户认证功能，涉及 Domain 层、UI 组件、页面路由

**暂存区文件**:
```
domain/auth/index.ts
domain/auth/schema.ts
domain/auth/type.d.ts
src/components/ui/form/index.tsx
src/components/ui/input/index.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
docs/auth.md
```

**生成的 Commit Plan**:
1. `feat: 新增认证 Domain 层` - domain/auth/**
2. `feat: 新增表单和输入组件` - src/components/ui/**
3. `feat: 新增认证页面` - src/app/(auth)/**
4. `docs: 添加认证文档` - docs/auth.md

### 案例 2: 代码重构

**场景**: 重构了多个模块，同时删除了旧代码

**暂存区文件**:
```
domain/user/index.ts (修改)
domain/user/service.ts (修改)
src/components/user/profile.tsx (修改)
domain/old-user/** (删除)
src/components/old-user/** (删除)
```

**生成的 Commit Plan**:
1. `refactor: 重构用户 Domain 层` - domain/user/**
2. `refactor: 重构用户组件` - src/components/user/**
3. `chore: 删除旧用户模块` - domain/old-user/**, src/components/old-user/**

### 案例 3: Bug 修复 + 配置更新

**场景**: 修复了一个 bug，同时更新了相关配置

**暂存区文件**:
```
src/lib/http.ts (修复)
src/lib/http.test.ts (新增测试)
.env.example (更新)
next.config.ts (更新)
```

**生成的 Commit Plan**:
1. `fix: 修复 HTTP 请求超时问题` - src/lib/http.ts, src/lib/http.test.ts
2. `config: 更新环境变量和 Next.js 配置` - .env.example, next.config.ts

## 配置适配示例

### 项目 A: Angular Preset

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-angular']
};
```

**Skill 自动识别的类型**:
- feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

### 项目 B: 自定义配置

```javascript
// commitlint.config.js
module.exports = {
  rules: {
    'type-enum': [2, 'always', [
      'feature',    // 新功能
      'bugfix',     // Bug 修复
      'hotfix',     // 紧急修复
      'refactor',   // 重构
      'docs',       // 文档
      'cleanup'     // 清理
    ]],
    'subject-max-length': [2, 'always', 60]
  }
};
```

**Skill 自动适配**:
- 使用 `feature` 替代 `feat`
- 使用 `bugfix` 替代 `fix`
- 使用 `cleanup` 替代 `chore`
- Subject 最大长度调整为 60 字符

**生成的 Commit Plan**:
```markdown
**Commitlint 配置**: commitlint.config.js
**允许的类型**: feature, bugfix, hotfix, refactor, docs, cleanup
**Subject 最大长度**: 60 字符
```

## 智能推断规则

### 文件路径 → Type 映射

| 文件路径 | 推断 Type | 说明 |
|---------|----------|------|
| `eslint.config.js` | `config` | 配置文件 |
| `docs/api.md` | `docs` | 文档 |
| `src/lib/utils.test.ts` | `test` | 测试文件 |
| `src/styles/global.scss` | `style` | 样式文件 |
| `package-lock.json` | `build` | 依赖锁文件 |
| `domain/auth/index.ts` (新增) | `feat` | 新功能 |
| `src/components/button/index.tsx` (修改) | `improvement` | 功能改进 |
| `src/lib/http.ts` (包含 "fix") | `fix` | Bug 修复 |
| `domain/old/**` (删除) | `chore` | 清理代码 |

### 特殊情况处理

1. **配置文件优先**: 即使在功能开发中，配置文件也会独立 commit
2. **文档独立**: 除非与代码强相关，否则文档单独 commit
3. **测试跟随**: 测试文件通常与被测试代码在同一 commit
4. **删除独立**: 大量删除操作单独 commit，便于回滚

## 最佳实践

### ✅ 推荐做法

1. **功能完成后再提交**: 确保每个 commit 都是完整的功能点
2. **审查 commit plan**: 仔细检查分组是否合理
3. **调整 subject**: 如果自动生成的 subject 不够准确，可以手动修改
4. **保持配置更新**: 及时更新 commitlint 配置以适应团队规范

### ❌ 避免做法

1. **不要混合不相关功能**: 即使文件在同一目录，不相关的功能也应分开
2. **不要忽略配置文件**: 配置变更应该独立追踪
3. **不要跳过审查**: 始终审查 commit plan 再执行
4. **不要手动修改 type**: 如果推断的 type 不对，应该调整文件分组而不是修改 type

## 故障排查

### 问题 1: 找不到 commitlint 配置

**错误信息**: "未找到 commitlint 配置文件"

**解决方案**:
1. 确认项目根目录存在配置文件
2. 检查配置文件名是否正确
3. 如果使用 `package.json`，确认有 `commitlint` 字段

### 问题 2: Type 推断不准确

**错误信息**: "推断的 type 不在允许列表中"

**解决方案**:
1. 检查 commitlint 配置的 `type-enum` 规则
2. 确认文件路径符合推断规则
3. 手动调整文件分组

### 问题 3: Subject 超长

**错误信息**: "Subject 超过最大长度限制"

**解决方案**:
1. 简化 subject 描述
2. 将详细说明移到 body
3. 检查 commitlint 配置的 `subject-max-length` 规则

## 进阶用法

### 自定义分组策略

如果默认分组不符合需求，可以在 commit plan 确认阶段手动调整：

1. 查看生成的 commit plan
2. 识别需要调整的分组
3. 在确认时选择 "调整"
4. 重新组织文件分组
5. 重新生成 commit plan

### 集成 CI/CD

在 CI/CD 流程中验证 commit message：

```yaml
# .github/workflows/commitlint.yml
name: Commitlint
on: [push, pull_request]
jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: wagoid/commitlint-github-action@v5
```

### 团队协作

1. **统一配置**: 确保团队使用相同的 commitlint 配置
2. **定期审查**: 定期审查 commit 历史，优化分组策略
3. **文档化**: 将常见分组模式文档化，便于团队成员参考
