---
name: smart-commit
description: 智能分析暂存区文件，按功能归类进行最小化 commit，符合 commitlint 规范
user-invocable: true
---

# Smart Commit - 智能提交

## S - Scope
- **Target**: Git 暂存区文件的智能分组提交
- **Cover**:
  - 自动分析文件变更类型和功能关联
  - 按功能模块归类文件
  - 生成符合 commitlint 规范的 commit message
  - 最小化 commit 粒度，确保可追溯性
- **Avoid**:
  - 不处理未暂存的文件
  - 不生成包含署名的 commit message
  - 不合并不相关的功能变更

## P - Process

### 0. 安全模式 (Stash 保护)

**核心原则**: 在任何分组提交操作前，先创建安全快照，确保原始状态可恢复。

#### 0.1 创建安全备份

```bash
# 步骤 1: 记录当前 HEAD 作为回滚点
ROLLBACK_POINT=$(git rev-parse HEAD)

# 步骤 2: 保存暂存区快照 (包含所有 staged 文件)
BACKUP_ID="smart-commit-$(date +%Y%m%d-%H%M%S)"
git stash push -m "${BACKUP_ID}-staged" --staged --quiet

# 步骤 3: 立即恢复暂存区 (stash 仍保留作为备份)
git stash apply --quiet
```

#### 0.2 安全执行流程

```
┌─────────────────────────────────────────────────────────┐
│  1. 创建 Stash 备份 (BACKUP_ID)                         │
│  2. 记录 ROLLBACK_POINT = HEAD                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. 分析暂存区 → 生成分组 → 用户确认                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. 对每个分组:                                         │
│     a. git reset HEAD (清空暂存区)                      │
│     b. git add <group-files> (只添加当前组)             │
│     c. git commit -m "..."                              │
│     d. 记录成功: COMPLETED_COMMITS += commit_hash       │
└─────────────────────────────────────────────────────────┘
                          ↓
              ┌───── 成功? ─────┐
              │                 │
            是 ↓               否 ↓
┌─────────────────────┐  ┌─────────────────────────────────┐
│ 5a. 清理备份 stash  │  │ 5b. 错误恢复流程                │
│ git stash drop      │  │     - 显示已完成的 commits      │
└─────────────────────┘  │     - 提供恢复选项              │
                         └─────────────────────────────────┘
```

#### 0.3 错误恢复选项

当提交过程中发生错误时，提供以下选项：

| 选项 | 命令 | 说明 |
|------|------|------|
| **继续** | 手动修复后继续 | 保留已完成的 commits，继续剩余分组 |
| **回滚全部** | `git reset --soft ${ROLLBACK_POINT}` | 撤销所有新 commits，保留文件变更 |
| **恢复原始状态** | `git reset --hard ${ROLLBACK_POINT} && git stash pop` | 完全恢复到执行前状态 |
| **保留已完成** | 无操作 | 接受部分完成的状态 |

#### 0.4 备份清理

```bash
# 成功完成后清理备份
git stash list | grep "${BACKUP_ID}" | cut -d: -f1 | xargs -I {} git stash drop {}

# 或手动清理所有 smart-commit 备份
git stash list | grep "smart-commit-" | cut -d: -f1 | head -1 | xargs git stash drop
```

### 1. 读取 Commitlint 配置

**优先级顺序**:
1. `commitlint.config.js`
2. `commitlint.config.ts`
3. `.commitlintrc.js`
4. `.commitlintrc.json`
5. `package.json` 中的 `commitlint` 字段

**提取信息**:
```javascript
// 从配置中提取 type-enum 规则
const config = require('./commitlint.config.js');
const allowedTypes = config.rules['type-enum'][2]; // ['feat', 'fix', 'docs', ...]
const maxSubjectLength = config.rules['subject-max-length']?.[2] || 50;
const maxHeaderLength = config.rules['header-max-length']?.[2] || 72;
```

**动态 Type 映射**:
- 根据配置中的 `type-enum` 动态生成可用类型列表
- 自动适配项目的 commitlint 规范
- 配置更新后无需修改 skill

### 2. 分析暂存区
```bash
# 获取暂存区文件状态
git diff --cached --name-status
git diff --cached --stat
```

### 3. 文件分组策略

按以下维度进行分组：

#### 2.1 按变更类型分组
- **新增 (A)**: 新文件
- **修改 (M)**: 已有文件修改
- **删除 (D)**: 文件删除
- **重命名 (R)**: 文件移动/重命名

#### 2.2 按功能模块分组
- **Domain 层**: `domain/**/*`
- **UI 组件**: `src/components/**/*`
- **页面路由**: `src/app/**/*`
- **配置文件**: `*.config.*`, `.eslintrc.*`, `tsconfig.json`
- **文档**: `docs/**/*`, `*.md`
- **样式**: `src/styles/**/*`
- **测试**: `**/*.test.*`, `**/*.spec.*`
- **Skills**: `.claude/skills/**/*`

#### 2.3 按业务功能分组
- 识别相关文件（如 domain + controller + page）
- 同一功能的增删改应在同一 commit
- 配置变更独立 commit

### 4. Commit Type 智能推断

**基于文件路径和变更类型自动推断**:

```javascript
function inferCommitType(files, changeType, allowedTypes) {
  // 优先级规则（从高到低）
  const rules = [
    // 配置文件
    { pattern: /\.(config|rc)\.(js|ts|json)$|^\..*rc$|tsconfig\.json|package\.json/, type: 'config' },

    // 文档
    { pattern: /^docs\/|\.md$|^README/, type: 'docs' },

    // 测试
    { pattern: /\.(test|spec)\.(ts|tsx|js|jsx)$|__tests__/, type: 'test' },

    // 样式
    { pattern: /\.(css|scss|sass|less)$|^src\/styles\//, type: 'style' },

    // 构建/依赖
    { pattern: /package-lock\.json|yarn\.lock|pnpm-lock\.yaml/, type: 'build' },

    // 性能优化（需要结合 diff 内容判断）
    { pattern: /performance|optimization/, type: 'perf' },

    // 新功能（新增文件 + domain/components/app）
    { pattern: /^(domain|src\/(components|app))\//, type: changeType === 'A' ? 'feat' : 'improvement' },

    // Bug 修复（需要结合 commit message 或文件名）
    { pattern: /fix|bug|error/, type: 'fix' },

    // 重构
    { pattern: /refactor/, type: 'refactor' },

    // 默认
    { pattern: /.*/, type: 'chore' }
  ];

  // 匹配规则并验证 type 是否在 allowedTypes 中
  for (const rule of rules) {
    if (files.some(f => rule.pattern.test(f))) {
      if (allowedTypes.includes(rule.type)) {
        return rule.type;
      }
    }
  }

  return allowedTypes[0]; // 返回第一个允许的类型作为默认值
}
```

**Type 推断示例**:

| 文件路径 | 变更类型 | 推断 Type | 说明 |
|---------|---------|----------|------|
| `domain/auth/index.ts` | A (新增) | `feat` | 新增 Domain 模块 |
| `src/components/ui/button/index.tsx` | M (修改) | `improvement` | 改进现有组件 |
| `docs/architecture.md` | M | `docs` | 文档更新 |
| `eslint.config.js` | M | `config` | 配置变更 |
| `src/styles/index.scss` | M | `style` | 样式调整 |
| `domain/example/**/*` | D (删除) | `chore` | 清理代码 |

### 5. Commit Message 规范

```
<type>: <subject>

[optional body]

[optional footer]
```

**规则**:
- `type`: 必须是 commitlint 配置中的类型（动态读取）
- `subject`: 简短描述（长度限制从配置读取，默认 ≤50 字符），中文，无句号
- `body`: 详细说明（可选），换行后添加
- `footer`: 关联 issue（可选）
- **禁止**: 包含署名（如 "by Claude"）
- **验证**: 生成的 commit message 必须通过 commitlint 验证

### 6. 执行流程

```
1. 创建安全备份 (Stash + ROLLBACK_POINT)
   ↓
2. 读取 commitlint 配置
   ↓ (提取 type-enum, subject-max-length 等规则)
3. 读取暂存区文件
   ↓
4. 按模块+功能分组
   ↓
5. 为每组智能推断 commit type
   ↓
6. 生成 commit plan（展示配置来源 + 备份信息）
   ↓
7. 用户确认 commit plan
   ↓
8. 对每个分组执行:
   a. git reset HEAD (清空暂存区)
   b. git add <group-files>
   c. git commit -m "..."
   d. 记录成功的 commit hash
   ↓
9. 全部成功 → 清理备份 stash
   部分失败 → 显示恢复选项
   ↓
10. 输出 commit 摘要
```

## O - Output

### Commit Plan 格式

```markdown
## Commit Plan

**安全备份**: `smart-commit-20250201-143052-staged` (stash@{0})
**回滚点**: `abc1234` (HEAD)

---

### Commit 1: feat: 新增认证模块
**文件** (3):
- domain/auth/index.ts
- domain/auth/schema.ts
- domain/auth/type.d.ts

**说明**: 实现用户认证的 Domain 层逻辑

---

### Commit 2: feat: 新增认证页面
**文件** (4):
- src/app/(auth)/layout.tsx
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/app/(auth)/forgot-password/page.tsx

**说明**: 实现登录、注册、忘记密码页面

---

### Commit 3: chore: 删除示例代码
**文件** (15):
- domain/example/**/* (删除)
- src/app/demo/**/* (删除)
- src/components/demo/**/* (删除)

**说明**: 清理项目示例和演示代码
```

### 执行结果

**成功场景**:
```
✓ Commit 1/3: feat: 新增认证模块 [abc1234]
✓ Commit 2/3: feat: 新增认证页面 [def5678]
✓ Commit 3/3: chore: 删除示例代码 [ghi9012]

总计: 3 个 commit，涉及 22 个文件
备份已清理: smart-commit-20250201-143052-staged
```

**失败场景**:
```
✓ Commit 1/3: feat: 新增认证模块 [abc1234]
✓ Commit 2/3: feat: 新增认证页面 [def5678]
✗ Commit 3/3: chore: 删除示例代码 - 失败

错误: pre-commit hook 失败

已完成 2/3 commits: abc1234, def5678
未提交文件: domain/example/**/* (15 files)

恢复选项:
  [1] 继续 - 修复问题后继续提交剩余文件
  [2] 回滚全部 - git reset --soft abc1233 (撤销所有新 commits，保留变更)
  [3] 恢复原始 - git reset --hard abc1233 && git stash pop (完全恢复)
  [4] 保留已完成 - 接受当前状态，手动处理剩余文件
```

## 分组算法

### 优先级规则

1. **配置文件独立**: `*.config.*`, `.gitignore` 等配置文件单独 commit
2. **文档独立**: `docs/**/*`, `*.md` 单独 commit（除非与代码强相关）
3. **Skills 独立**: `.claude/skills/**/*` 按 skill 分组
4. **功能内聚**: Domain + UI + Page 同一功能的文件合并
5. **删除操作**: 大量删除文件单独 commit
6. **样式独立**: 纯样式变更单独 commit

### 分组示例

```javascript
// 示例：当前暂存区文件
const stagedFiles = [
  'domain/auth/index.ts',           // 新增
  'domain/auth/schema.ts',          // 新增
  'src/app/(auth)/login/page.tsx',  // 新增
  'src/components/ui/form/index.tsx', // 新增
  'docs/architecture.md',           // 修改
  '.gitignore',                     // 修改
  'domain/example/**/*'             // 删除 (多个文件)
];

// 分组结果
const groups = [
  {
    type: 'feat',
    subject: '新增认证模块',
    files: ['domain/auth/index.ts', 'domain/auth/schema.ts']
  },
  {
    type: 'feat',
    subject: '新增认证页面和表单组件',
    files: ['src/app/(auth)/login/page.tsx', 'src/components/ui/form/index.tsx']
  },
  {
    type: 'docs',
    subject: '更新架构文档',
    files: ['docs/architecture.md']
  },
  {
    type: 'config',
    subject: '更新 gitignore 配置',
    files: ['.gitignore']
  },
  {
    type: 'chore',
    subject: '删除示例代码',
    files: ['domain/example/**/*']
  }
];
```

## 使用方式

```bash
# 1. 添加文件到暂存区
git add <files>

# 2. 调用 skill
/smart-commit

# 3. 确认 commit plan
# 4. 自动执行提交
```

## 质量检查

- [ ] 每个 commit 只包含一个功能点
- [ ] Commit message 符合 commitlint 规范
- [ ] 无署名信息
- [ ] Subject ≤ 50 字符
- [ ] 相关文件在同一 commit
- [ ] 配置/文档/代码分离
- [ ] 可独立回滚每个 commit
- [ ] **安全备份已创建** (stash)
- [ ] **回滚点已记录** (ROLLBACK_POINT)
- [ ] **失败时提供恢复选项**

## Anti-Patterns

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| 所有文件一次 commit | 按功能分组 commit | 无法追溯单一变更 |
| `feat: 更新代码 by Claude` | `feat: 新增认证模块` | 包含署名，描述不清晰 |
| 混合配置和功能代码 | 配置独立 commit | 配置变更应独立追踪 |
| Subject 超过 72 字符 | 控制在 50 字符内 | commitlint 规则限制 |
| 删除和新增混在一起 | 删除独立 commit | 便于回滚和审查 |
| **直接操作暂存区** | **先创建 stash 备份** | 防止文件丢失 |
| **失败后无法恢复** | **提供多种恢复选项** | 保证数据安全 |
| **忽略部分完成状态** | **记录已完成的 commits** | 便于决策和恢复 |

## Related Skills

- `/commit`: 标准 commit 流程（单次提交）
- `/coding-standards`: 编码规范（代码质量检查）
- `/project-architecture`: 项目架构（理解模块划分）
