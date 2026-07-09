# Gotchas

## 幽灵依赖

- **用了 package.json 未声明的包** → pnpm 严格模式下直接解析失败；新建包时 MUST 完整填写 dependencies / peerDependencies / devDependencies
- **跨包版本漂移** → 用 syncpack 检测（`pnpm verify:deps`）

## exports 解析失败

- **exports 指向 dist 但没 build** → 本模板走源码消费，exports 指向 `src/index.ts`
- **子路径未在 exports 声明** → `@kkfive/domain-core/material` 这种需要在 exports 加 `"./material"` 入口
- **`types` 与 `default` 指向不同文件** → 源码消费时两者都指向 `src/index.ts`，保持一致

## project references

- **tsconfig 漏 `references`** → `tsc --build` 不认依赖图，跨包类型检查失效；每个依赖的 workspace 包都要声明
- **根 tsconfig.json 没追加 references** → 新包不进 solution，`tsc --build` 跳过它
- **`composite: true` 未启用** → base.json 已强制；自定义 tsconfig 时确保继承

## 依赖边界

- **`@kkfive/contracts` 或 `@kkfive/utils` 引入运行时框架** → 污染所有消费方 bundle；这两个包零运行时依赖
- **`@kkfive/domain-core` 写 React/Next/Hono** → 破坏框架无关性；hooks/路由留各 app
- **`@kkfive/ui` 含 antd** → antd 由各 app 自治，不进共享包
- **运行时框架写进 dependencies 而非 peer** → 消费方重复安装、实例不一致；React/Hono 等走 peerDependencies

## workspace 注册

- **新包未注册 workspace** → 确认 `pnpm-workspace.yaml` 的 `packages:` 含 `'packages/*'`
- **消费方未加 `transpilePackages`** → Next.js app 消费 workspace 包时需在 `next.config.ts` 加 `transpilePackages: ['@kkfive/<pkg>']`，否则不编译源码
- **改完包忘记 `pnpm install`** → workspace 链接不更新
