# Smart Commit Skill

智能分析 Git 暂存区文件，按功能归类进行最小化 commit，**动态读取项目 commitlint 配置**，确保每个提交符合规范且可追溯。

## 功能特性

- ✅ **动态配置读取**: 自动读取项目 commitlint 配置，无需手动维护 type 映射
- ✅ **智能分组**: 自动识别文件功能关联，按模块和业务逻辑分组
- ✅ **智能 Type 推断**: 基于文件路径和变更类型自动推断 commit type
- ✅ **最小化粒度**: 每个 commit 只包含一个功能点，便于回滚和追溯
- ✅ **规范遵守**: 严格符合项目 commitlint 配置（动态适配）
- ✅ **无署名**: 自动过滤署名信息，保持 commit message 专业性
- ✅ **交互确认**: 生成 commit plan 供用户审查后执行
- ✅ **配置展示**: 在 commit plan 中展示当前使用的 commitlint 规则

## 动态配置读取

### 支持的配置文件（优先级顺序）

1. `commitlint.config.js`
2. `commitlint.config.ts`
3. `.commitlintrc.js`
4. `.commitlintrc.json`
5. `package.json` 中的 `commitlint` 字段

### 自动提取的规则

- **type-enum**: 允许的 commit 类型列表
- **subject-max-length**: Subject 最大长度限制
- **header-max-length**: Header 最大长度限制
- **type-case**: Type 大小写规则
- **subject-empty**: Subject 是否允许为空

### 优势

- ✅ 配置更新后无需修改 skill
- ✅ 自动适配不同项目的 commitlint 规范
- ✅ 在 commit plan 中展示当前配置来源
- ✅ 智能推断的 type 保证在允许列表中

## 智能 Type 推断

基于文件路径和变更类型自动推断 commit type：

| 文件特征 | 推断 Type | 说明 |
|---------|----------|------|
| `*.config.*`, `.eslintrc.*` | `config` | 配置文件 |
| `docs/**/*`, `*.md` | `docs` | 文档 |
| `*.test.*`, `*.spec.*` | `test` | 测试文件 |
| `*.css`, `*.scss`, `src/styles/**` | `style` | 样式文件 |
| `package-lock.json`, `yarn.lock` | `build` | 依赖锁文件 |
| `domain/**/*`, `src/components/**` (新增) | `feat` | 新功能 |
| `domain/**/*`, `src/components/**` (修改) | `improvement` | 功能改进 |
| 包含 `fix`, `bug`, `error` | `fix` | Bug 修复 |
| 删除操作 | `chore` | 清理代码 |

## 使用场景

### 场景 1: 大量文件需要分类提交
```bash
# 暂存了 50+ 个文件，涉及多个功能模块
git add .
/smart-commit
```

### 场景 2: 重构后的批量提交
```bash
# 重构了多个模块，需要按模块分别提交
git add domain/ src/components/ docs/
/smart-commit
```

### 场景 3: 清理代码和添加新功能
```bash
# 同时删除旧代码和添加新功能
git add -A
/smart-commit
# 自动分离删除和新增操作
```

## 分组策略

### 1. 按模块分组
- **Domain 层**: `domain/**/*`
- **UI 组件**: `src/components/**/*`
- **页面路由**: `src/app/**/*`
- **配置文件**: `*.config.*`, `.eslintrc.*`
- **文档**: `docs/**/*`, `*.md`
- **Skills**: `.claude/skills/**/*`

### 2. 按功能内聚
- 同一功能的 Domain + Controller + Page 合并
- 相关的 UI 组件和样式合并
- 配置文件独立提交

### 3. 按变更类型
- 新增功能 → `feat`
- 删除代码 → `chore`
- 配置变更 → `config`
- 文档更新 → `docs`

## Commit Type 参考

**注意**: 实际可用的 type 列表由项目 commitlint 配置决定，以下仅为常见示例。

| Type | 常见使用场景 |
|------|------------|
| `feat` | 新功能、新模块 |
| `improvement` | 增强现有功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构代码 |
| `docs` | 文档变更 |
| `style` | 样式调整 |
| `test` | 测试相关 |
| `config` | 配置文件 |
| `chore` | 其他杂项 |
| `perf` | 性能优化 |

**Skill 会自动读取你的项目配置，无需手动维护此列表。**

## 示例输出

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

### Commit 2: feat: 新增认证页面
**类型推断**: feat (新增页面路由)
**文件** (4):
- src/app/(auth)/layout.tsx
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/app/(auth)/forgot-password/page.tsx

### Commit 3: chore: 删除示例代码
**类型推断**: chore (删除操作)
**文件** (15):
- domain/example/**/* (删除)
- src/app/demo/**/* (删除)
```

## 质量保证

- ✅ 每个 commit 可独立回滚
- ✅ Commit type 在项目 commitlint 配置的 type-enum 中
- ✅ Subject 长度符合配置限制
- ✅ Header 长度符合配置限制
- ✅ 无署名信息
- ✅ 功能内聚，职责单一
- ✅ 配置更新自动生效

## 配置适配示例

### 项目 A (Angular preset)
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-angular']
};
```
**Skill 自动识别**: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

### 项目 B (自定义配置)
```javascript
// commitlint.config.js
module.exports = {
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'hotfix', 'docs', 'cleanup']]
  }
};
```
**Skill 自动识别**: feat, fix, hotfix, docs, cleanup

## 注意事项

1. **暂存区要求**: 只处理已 `git add` 的文件
2. **配置文件**: 需要项目根目录存在 commitlint 配置文件
3. **交互确认**: 执行前会展示 commit plan（包含配置信息），需用户确认
4. **规范检查**: 自动验证 commitlint 规则，不合规会提示修改
5. **最小粒度**: 优先拆分，避免大而全的 commit
6. **配置更新**: 修改 commitlint 配置后，skill 自动适配，无需重启

## 相关命令

- `/commit`: 标准单次提交流程
- `git log --oneline`: 查看提交历史
- `git rebase -i`: 交互式修改历史提交
