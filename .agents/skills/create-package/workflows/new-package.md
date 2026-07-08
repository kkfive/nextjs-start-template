# 新建共享包流程

## 前置判断

新建 package 前，确认：
1. **通用性**："换一个新项目，这个包还能直接用吗？"——不能就留在 app 内部
2. **多消费方**：是否已有或预期多个 app 消费？只有一个消费方时宁可晚抽离
3. **命名**：`@kkfive/<pkg>`，kebab-case，语义清晰（如 `@kkfive/contracts`、`@kkfive/utils`）

## 步骤

1. **创建目录** `packages/<pkg>/`
2. **写 `package.json`**（见 `references/package-anatomy.md`）：
   - `name`: `@kkfive/<pkg>`
   - `private: true`（本模板不发布）
   - `exports` 指向 `src/index.ts`
   - 完整声明 `dependencies` / `peerDependencies` / `devDependencies`
3. **写 `tsconfig.json`**：
   - `extends: @kkfive/tsconfig/base.json`
   - `compilerOptions.outDir` / `rootDir`
   - `include: ["src"]`
   - `references` 声明依赖的 workspace 包
4. **写源码** `src/index.ts` 与模块文件
5. **注册到 workspace**：
   - 确认 `pnpm-workspace.yaml` 的 `packages:` 包含 `'packages/*'`（通常已配）
   - 在根 `tsconfig.json` 的 `references` 数组追加 `{ "path": "packages/<pkg>" }`
6. **消费方接入**：各 app 的 `package.json` 加 `"@kkfive/<pkg>": "workspace:*"`，Next.js app 还需在 `transpilePackages` 加该包名
7. **`pnpm install`** 让 workspace 链接生效

## 模板

### package.json

```json
{
  "name": "@kkfive/<pkg>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "dependencies": {},
  "peerDependencies": {},
  "devDependencies": {
    "@kkfive/tsconfig": "workspace:*"
  }
}
```

### tsconfig.json

```json
{
  "extends": "@kkfive/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "references": []
}
```

## 检查

- [ ] exports 指向 `src/index.ts`（不预 build）
- [ ] tsconfig `extends @kkfive/tsconfig/base.json`，含 `references`
- [ ] 依赖完整声明（deps / peer / dev 分清）
- [ ] 根 `tsconfig.json` references 已追加
- [ ] 运行时框架（React 等）走 peerDependencies
- [ ] packages 通用性满足（不绑定特定业务）
- [ ] `pnpm install` 后 workspace 链接正常

详细字段说明见 `references/package-anatomy.md`，常见错误见 `references/gotchas.md`。
