# 读取 commitlint 配置

## 查找顺序

1. `commitlint.config.js`
2. `commitlint.config.ts`
3. `commitlint.config.mjs`
4. `.commitlintrc.js`
5. `.commitlintrc.json`
6. `.commitlintrc.yaml` / `.commitlintrc.yml`
7. `package.json` 的 `commitlint` 字段

找到一个即停。

## 关键字段

```js
{
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', ...]],
    'subject-max-length': [2, 'always', 50],
    'header-max-length':  [2, 'always', 72],
    'subject-case':       [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'body-leading-blank': [2, 'always'],
  },
  extends: ['@commitlint/config-conventional'],
}
```

## 提取约束（伪代码）

```js
const config = loadCommitlintConfig()
const allowedTypes = config.rules['type-enum']?.[2] ?? defaultTypes
const subjectMax   = config.rules['subject-max-length']?.[2] ?? 50
const headerMax    = config.rules['header-max-length']?.[2]  ?? 72
```

## 注意

- 若项目继承 `@commitlint/config-conventional`，应在内存中**合并**继承自基础配置的 `type-enum`，不要只读直接 rules
- 若 type 推断结果不在 `allowedTypes` → 退到 `allowedTypes[0]` 或 `chore`
- 配置更新后无需修改 skill —— 本 skill 始终动态读取

## 本项目（参考，以实际为准）

- 配置位置：项目 `commitlint.config.*` 或 `lefthook.yml` 触发的钩子
- 钩子见 `lefthook.yml`（commit-msg 校验）
