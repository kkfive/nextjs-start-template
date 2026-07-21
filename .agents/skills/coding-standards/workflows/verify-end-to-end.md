# Workflow: 端到端真实验证（Verify End-to-End）

**触发条件**：任务涉及"验证/核验/检查是否生效/是否按预期工作"，尤其是验证 AI 规范体系、配置、自动触发/注入机制、重构是否达预期。

**目标**：避免循环论证。用**真实运行证据**证明"运行时真的生效"，而非靠静态文件或自带脚本自证。

## 核心原则：警惕循环论证

用项目自带脚本（如 `verify-conventions`）验证项目自身的规范，是**循环论证**——脚本漏检/有 bug 就发现不了问题（例：`verify-conventions` 不查 CLAUDE↔AGENTS 一致性）。自带脚本只能证"文件长这样"，证不了"运行时真的生效"。

## Step 1: 判断验证目标类型

| 目标 | 特征 |
|---|---|
| 配置/规范是否生效 | "AI 优化是否生效""规范是否被遵循""重构是否达预期" |
| 自动触发/注入机制 | "skill 是否自动触发""路由是否加载""hook 是否注入" |
| 代码功能是否正确 | "这个功能能不能跑通""修复是否生效" |
| 仅静态一致性 | 文件结构/格式（自带脚本够用） |

## Step 2: 选择验证手段（按目标）

- **仅静态一致性** → grep/Read/自带脚本即可（最快）。
- **配置/规范/自动触发类** → **必须端到端真实运行**（Step 3），自带脚本不够。
- **代码功能类** → 实跑（run/test）+ 看日志。

## Step 3: 端到端真实运行（配置/规范/自动触发类核心）

1. **prepare**：在 clean source 与 Node 24 环境运行 `pnpm verify:ai-governance:e2e`。Harness 从 `scripts/repo-tooling/ai-governance-e2e/profiles.ts` 读取唯一 profile contract，创建 run-owned detached worktree，并生成 `commands.json`；本文不复制 profile 表。
2. **执行干净进程**：逐条执行 `commands.json` 中的 canonical Codex 命令。每条命令已经固定 `--mode write`、唯一 execution ID 与隔离 worktree；调用方必须使用 `run_in_background=true`，prompt 只包含真实业务要求，不提示读取规范或配置。
3. **collect**：所有 background delegate 完成后运行 `node scripts/repo-tooling/ai-governance-e2e/runner.ts collect <artifact-dir>`。Harness 直接解析持久化 JSONL 的成功 `command_exec`，收集实际治理文件读取、UTF-8 Token 估算、diff 与独立 gates；缺失或未知 schema 记为 `infrastructure_error`，不采信 agent 自述。
4. **cleanup**：审查 `report.json` 后运行 `node scripts/repo-tooling/ai-governance-e2e/runner.ts cleanup <artifact-dir>`。Cleanup 只删除 manifest 记录的 run-owned worktree，不触碰主工作树或其他运行资源。

## Step 4: 判据与归因

- **判据**：运行时行为证据（日志里的实际 tool call / 产物校验）> 文件静态 / 脚本自述。
- **归因要准**：发现意外改动时，**先确认来源**（时间戳/进程），勿把用户并行改动误记到工具头上。

## 示例

> 任务："核验本项目 AI 规范体系的优化是否真的生效"

1. 静态核验（7 维度）：发现 skill 自动触发疑似未生效、文档命名漂移等。
2. 端到端验证（3 个干净进程，worktree 隔离）：发现 skill 从不触发（靠 rules + 模仿）、规范遵循真实生效、违规被拒。
3. 修复（skill 软链等）后，再用干净进程验证：这次触发了 skill——铁证。
4. 归因：意外改动先查时间戳，确认是用户并行工作（非工具越界）。

## 反模式

| ❌ 不要 | ✅ 应该 |
|---|---|
| 只跑 `pnpm verify` 就说规范生效 | 端到端真实跑 + 验独立产物 |
| 自己（知情者）跑任务验证"自动触发" | 用没读过规范的干净进程 |
| 在主分支直接改着验证 | 开 worktree 隔离 |
| 把意外改动直接归因到工具 | 先查时间戳确认来源 |
