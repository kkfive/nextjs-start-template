# Workflow: 单向依赖机器校验

**触发条件**：把"单向依赖"规则（packages↛apps 等）从文档变成可自动运行的校验。

**目标**：扩展 `scripts/verify-conventions.mjs`，加一条扫描跨包 import 方向的规则。

## Step 1: 规则源

单向依赖**规则**定义在 `coding-standards/references/layer-dependency.md`：

- packages↛apps（共享包不依赖应用）
- apps↛apps（应用之间不互相依赖）
- internal↛apps/packages（工具链不依赖业务）

本 workflow 负责把这些规则**机器化**，不重复定义规则。

## Step 2: 为什么用 verify 脚本而非 madge/boundaries

- 项目已有 `verify-conventions.mjs` 的 G 规则模式（G01–G07），扩展它**零新依赖**
- packages 没有独立 eslint config，`eslint-plugin-boundaries` 无处挂载
- madge 检测**循环**依赖，但单向依赖是**方向**问题，用路径前缀判定更直接

## Step 3: 实现方法（以 G07 为例）

沿用 `rule(id, message, checkFn)` 模式，checkFn 自带 `globSync` 扫描：

1. `globSync` 扫各包源码（`packages/*/src/**`、`apps/*/src/**` 单层 `*` 展开，避免进 node_modules）
2. 正则提取相对路径 import（`import ... from './...'`），bare import（`@kkfive/*`）放行——跨层违规几乎只能靠相对路径绕过 workspace 协议
3. `path.resolve` 解析目标，按路径前缀判定所属层
4. 命中违规方向 → push issue

检测矩阵：

| 源层 | 违规目标 |
|---|---|
| packages | apps |
| internal | apps / packages |
| apps/A | apps/B（B≠A） |

## Step 4: 接入

G07 自动随 `pnpm verify:conventions` 运行（已在 lefthook pre-commit + CI lint job）。无需额外接线。

## Step 5: 先 dry-run 再固化

加规则后先全量跑，确认现有代码无违规：

```bash
node scripts/verify-conventions.mjs
```

若发现现存违规 → 报告，决定"修代码"还是"放宽规则"，**不擅自改业务代码**。反向验证可用一个临时违规 import 文件确认规则能抓到（验证后删除）。

## 边界

G07 只补**跨包方向**。应用内 domain↛UI 由 `internal/lint-config/rules/domain-boundary.js`（ESLint `no-restricted-imports`）覆盖，不重复。
