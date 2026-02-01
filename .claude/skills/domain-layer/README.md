# Domain Layer Skill

Domain 层架构规范 - 依赖注入、Service/Controller/Hooks 分层、类型定义、命名规范。

## 使用场景

- 创建新 Domain 模块
- 编写 Service/Controller/Hooks
- 理解数据流
- 解决依赖注入问题

## 调用方式

```
/domain-layer
```

## 核心规范

### 依赖注入

`http: HttpService` 始终作为第一个参数：

```typescript
getList: async (http: HttpService, query?: ListQuery) => { ... }
```

### 文件结构

```
domain/{module}/
├── const/api.ts      # API 常量 + Query Keys
├── type.d.ts         # 类型定义
├── service.ts        # 纯数据获取
├── controller.ts     # 数据转换 + 业务编排
├── hooks.ts          # React Query 封装
└── index.ts          # 统一导出
```

### Hooks 层

内部注入 `httpClient`：

```typescript
export function useMaterialList() {
  return useQuery({
    queryFn: () => materialController.getList(httpClient),
  })
}
```

## References

- `references/dependency-injection.md` - 依赖注入规范
- `references/file-structure.md` - 文件结构规范
- `references/naming-conventions.md` - 命名规范
- `references/hooks-layer.md` - Hooks 层规范
- `references/examples.md` - 完整示例
