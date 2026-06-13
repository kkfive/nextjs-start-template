# Commit Message 规范

## 格式

```
<type>: <subject>

[optional body]

[optional footer]
```

## 硬约束

- **type**：必须是 commitlint `type-enum` 内的值（动态读取，见 `references/commitlint-config.md`）
- **subject**：
  - 中文描述，简短、动词开头
  - 末尾**不加句号**
  - 长度 ≤ commitlint `subject-max-length`（默认 50）
  - 整行 header（`type: subject`）≤ `header-max-length`（默认 72）
- **禁署名**：不允许出现 `by Claude` / `Co-Authored-By` / `Generated with` 等署名信息
- **单一功能**：一个 commit 只反映一个意图

## 推荐风格（本项目）

| type | 何时 |
|---|---|
| `feat` | 新增可被用户感知的能力 |
| `fix` | 修复 bug |
| `refactor` | 不改外部行为的内部改写 |
| `docs` | 仅文档 |
| `test` | 仅测试 |
| `chore` | 杂项、清理、不影响业务 |
| `style` | 样式、格式化、不改逻辑 |
| `perf` | 性能优化 |
| `build` | 构建/依赖 |
| `config` | 配置文件 |

实际可用 type 以 commitlint 配置为准。

## 反例

| ❌ | ✅ |
|---|---|
| `feat: 更新代码 by Claude` | `feat: 新增认证模块` |
| `feat: 添加了新的素材列表页面以及其相关的所有组件和样式。` | `feat: 新增素材列表页` |
| `update.` | `chore: 清理示例代码` |
| `Fixed bug` | `fix: 修复登录态丢失` |
