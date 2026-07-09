# Create Package Skill

新建共享包规范 - 目录结构、package.json exports、tsconfig project references、peer deps、workspace 注册。

## 使用场景

- 在 `packages/` 下新建共享包
- 配置源码消费（exports 指向 src）
- 声明依赖边界（deps / peer / dev）
- 注册到 workspace 与根 tsconfig

## 调用方式

```
/create-package
```

## 核心原则

- **源码消费**：exports 指向 `src/index.ts`，不预 build
- **tsconfig project references**：`composite: true` + `references` 声明依赖的 workspace 包
- **依赖完整且最小**：未声明的 import 在 pnpm 严格模式下直接解析失败
- **通用性**：新包必须能跨项目复用，否则留在 app 内

## References

- `workflows/new-package.md` - 新建包完整流程
- `references/package-anatomy.md` - 包结构与 exports 详解
- `references/gotchas.md` - 踩坑速查
