# Workflow: 单向依赖机器校验

**触发条件**：把"单向依赖"规则（packages↛apps 等）从文档变成可自动运行的校验。

**目标**：扩展 `scripts/repo-tooling/architecture-policy/`，由现有 CLI 与 fixtures 统一验证。

## Step 1: 规则源

单向依赖**规则**定义在 `coding-standards/references/layer-dependency.md`：

- packages↛apps（共享包不依赖应用）
- apps↛apps（应用之间不互相依赖）
- internal↛apps/packages（工具链不依赖业务）

本 workflow 负责把这些规则**机器化**，不重复定义规则。

## Step 2: 为什么扩展现有 policy

- `scripts/verify-conventions.mjs` 已是薄 CLI，真实规则实现集中在 repository-local policy
- 根 ESLint 负责文件级 lint；architecture policy 负责跨目录、manifest 与 type-only edge 等仓库级事实
- 不引入 madge/boundaries，也不创建新的 internal tooling package

## Step 3: 实现方法

1. 在 `architecture-policy/rules/` 新增或修改单一规则模块
2. 复用 parser 与 manifest scanner，不在规则内重复遍历仓库
3. 在 registry 登记规则，并为合法、非法场景分别补 `__fixtures__/<RULE>/valid|invalid`
4. 若存在窄例外，把允许条件编码成可判定的路径、import kind 与 manifest section，而不是自然语言豁免

## Step 4: 接入

规则自动随 `pnpm run verify:architecture` 运行；fixture 由 `pnpm run verify:fixtures` 覆盖。不要再增加第二个 task owner。

## Step 5: 先 dry-run 再固化

加规则后先全量跑，确认现有代码无违规：

```bash
pnpm run verify:architecture
pnpm run verify:fixtures
```

若发现现存违规 → 报告，决定"修代码"还是"放宽规则"，**不擅自改业务代码**。反向验证可用一个临时违规 import 文件确认规则能抓到（验证后删除）。

## 边界

文件内语法和常规 import 限制留给根 ESLint；需要理解仓库路径、manifest 或跨文件关系的规则进入 architecture policy。
