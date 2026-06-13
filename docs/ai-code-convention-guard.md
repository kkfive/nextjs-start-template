# AI 代码规范校验方案

## 设计理念：四层防护

确保 AI 写的代码符合规范，单靠一层校验是不够的。本方案采用 **Prompt 约束 → 生成后脚本校验 → 提交前 Git Hook 拦截 → CI 类型兜底** 的四层防护体系。

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Prompt 约束（生成时）                              │
│  AI 生成代码前，system prompt 中嵌入规范检查清单              │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: 脚本校验（生成后）                                  │
│  AI 输出完成后，运行 npm run verify:conventions 自动检查      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Git Hook（提交前）                                 │
│  lefthook pre-commit 自动运行，拦截不合规代码                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: TypeScript（编译时）                                │
│  tsc --noEmit 兜底，确保类型安全                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Prompt 约束

在 AI 的 system prompt 或工作流中嵌入规范检查清单，让 AI 在生成代码时自我约束。

**推荐方式**：在 `.agents/skills/` 的相关工作流中附加以下提示：

```
【Domain 层编码规范 - 生成后自检清单】

生成 domain 模块代码后，请逐项确认：
- [ ] type 文件名为 type.ts（非 type.d.ts）
- [ ] 使用 export type（非 declare namespace / interface）
- [ ] index.ts 包含 export type * from './type'
- [ ] Controller 使用 export async function（非 class）
- [ ] Service/Controller 第一个参数为 HttpService
- [ ] 无 @ts-expect-error、无 any
- [ ] api.ts 使用命名导出（非 export default）
- [ ] 存在 hooks.ts（有数据获取时）
- [ ] hooks.ts 从 @/service/index.client 导入 httpClient

【通用约束】
- [ ] 无 as 类型断言
- [ ] src/service/ 中无 console.error / console.warn
```

> 本文档是治理方案说明；可执行步骤应沉淀到 `.agents/skills/` 的 workflow 或 rule 中。

---

## Layer 2: 生成后脚本校验

**脚本位置**：`scripts/verify-conventions.mjs`

**运行方式**：

```bash
# 全量检查
npm run verify:conventions

# 单文件检查（AI 生成新文件后）
node scripts/verify-conventions.mjs domain/example/user/controller.ts
```

**当前已实现的 16 条规则**：

| 规则 | 说明 | 适用场景 |
|------|------|---------|
| D01 | type 文件后缀应为 .ts | Domain 类型定义 |
| D02 | 无 declare namespace | Domain 类型定义 |
| D03 | index.ts 导出类型 | Domain 模块入口 |
| D04 | Controller 使用函数导出 | Domain Controller |
| D05 | 第一个参数为 HttpService | Domain Service/Controller |
| D06 | 无 @ts-expect-error | Domain 全层 |
| D07 | 无 any | Domain 全层 |
| D08 | 存在 hooks.ts | Domain 数据模块 |
| D09 | hooks.ts 导入 httpClient | Domain hooks |
| D10 | api.ts 命名导出 | Domain API 常量 |
| D11 | 文件结构完整 | Domain 模块 |
| U01 | UI 不直接导入 controller | UI/App 层 |
| U02 | UI 无 any | UI Domain 组件 |
| L01 | 无 as 类型断言 | src/lib/request |
| L02 | 无 console.error/warn | src/service/ |
| L03 | 优先 type 非 interface | src/lib/request/type.ts |

**输出示例**：

```
  [FAIL] D01  Domain 类型文件后缀应为 .ts（非 .d.ts）
         domain/example/hitokoto/type.d.ts:1  类型文件应重命名为 type.ts

  [PASS] D04  Controller 应使用命名导出函数（非 class）

  发现 N 个问题  X 条规则未通过  Y 条通过
```

---

## Layer 3: Git Hook（提交前拦截）

**配置位置**：`lefthook.yml`

已集成到 `pre-commit` hook，与 lint 并行运行：

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: '*'
      run: npm run lint:fix {staged_files}
    conventions:
      glob: '*'
      run: npm run verify:conventions
```

**效果**：当 AI 生成代码后，开发者执行 `git commit` 时，如果代码不符合规范，提交会被阻断：

```
[FAIL] D04  Controller 应使用命名导出函数（非 class）
         domain/example/user/controller.ts:6

exit status 1
```

---

## Layer 4: TypeScript 类型兜底

```bash
npm run verify:type   # tsc --noEmit
```

此层作为最终兜底，确保：
- 所有类型引用正确
- 无隐式 any
- 无未定义变量

---

## 在 AI 工作流中的使用

### 方式 A：AI 生成后自检（推荐）

AI 生成 domain 模块代码后，在工作流中自动执行：

```bash
# 1. AI 生成代码
# 2. 自动运行校验
node scripts/verify-conventions.mjs domain/example/user/controller.ts

# 3. 如果有问题，AI 修复后重新校验
# 循环直到通过
```

### 方式 B：作为 MCP Tool

可将校验脚本包装为 MCP Tool，供 AI 在对话中调用：

```
用户: "帮我实现用户模块"
AI: "生成代码中..."
AI: [调用 verify-conventions tool]
AI: "检测到 3 个问题，自动修复..."
```

### 方式 C：Review 阶段校验

在代码 review 流程中（如 team-review skill），将规范校验作为自动检查项：

```
reviewer agent:
  - 运行 verify:conventions
  - 将结果附加到 review 报告中
```

---

## 扩展规则

如需添加新规则，编辑 `scripts/verify-conventions.mjs`：

```javascript
rule('D12', '新规则描述', (ctx) => {
  const issues = []
  // 自定义检查逻辑
  return issues
})
```

规则接收 `ctx` 上下文对象：
- `ctx.domainModules` - Domain 模块目录列表
- `ctx.domainFiles` - Domain 下所有 .ts 文件列表

---

## 状态检查

规范校验结果会随代码变化而变化，不在本文档中固化具体失败数量。需要查看当前状态时运行：

```bash
pnpm run verify:conventions
```

全部修复后，此脚本将成为零成本的质量门禁——AI 生成的代码只要通过脚本，即可保证符合核心规范。
