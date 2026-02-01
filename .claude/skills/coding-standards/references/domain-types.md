# Domain 层类型定义规范

**文件命名**：`domain/{module}/type.d.ts`（必须使用 `.d.ts` 后缀）

## 规范

1. 使用 `declare namespace` 声明命名空间
2. **优先使用 `type` 而非 `interface`**（项目规范）
3. **禁止添加任何 export 语句**（保持全局可用）
4. **禁止添加任何 import 语句**（import 会将文件变为模块声明，失去全局可用性）
5. 命名空间名称使用 PascalCase，与模块名对应
6. 类型定义必须手动编写，不能依赖 `z.infer` 等需要导入的工具类型

## 为什么使用 .d.ts + declare namespace

| 优势 | 说明 |
|------|------|
| **全局可用** | 无需 import，减少导入语句 |
| **避免循环依赖** | 类型定义不参与运行时，不会引入模块依赖 |
| **语义明确** | `.d.ts` 明确表示"纯类型定义，无运行时代码" |
| **命名空间隔离** | 多个模块可以有同名类型，通过命名空间避免冲突 |
| **符合架构理念** | Domain 层框架无关，类型是编译时概念 |

## 示例

```typescript
// domain/material/type.d.ts
declare namespace Material {
  // ========== 响应类型 ==========

  /** 列表响应 */
  type ListResponse = {
    items: Item[]
    total: number
    page: number
    pageSize: number
  }

  /** 列表项 */
  type Item = {
    id: string
    name: string
    createdAt: string
  }

  /** 创建响应 */
  type CreateResponse = {
    id: string
  }

  // ========== 请求类型 ==========

  /** 创建请求 */
  type CreateRequest = {
    name: string
    category?: string
  }

  /** 列表查询 */
  type ListQuery = {
    page?: number
    pageSize?: number
    keyword?: string
  }
}

// ❌ 错误：不要添加 import（会将文件变为模块声明）
// import type { SomeType } from 'some-library'

// ❌ 错误：不要添加 export
// export type { Material }
```

## 类型命名规范

### 简化方案（推荐，大部分场景）

当 API 返回格式已符合前端需求时，不需要区分 API 类型和业务模型：

| 场景 | 命名格式 | 示例 |
|------|---------|------|
| 响应类型 | `{操作}Response` | `ListResponse`, `DetailResponse` |
| 实体类型 | `{实体}` | `Item`, `Detail` |
| 请求类型 | `{操作}Request` | `CreateRequest`, `UpdateRequest` |
| 查询类型 | `{操作}Query` | `ListQuery` |

### 完整方案（需要数据转换时）

当需要数据转换时，区分 API 类型和业务模型：

| 场景 | 命名格式 | 示例 |
|------|---------|------|
| API 原始类型 | `Api{操作}Response` | `ApiListResponse` |
| API 实体 | `Api{实体}` | `ApiItem` |
| 业务模型 | `{操作}Result` | `ListResult`（转换后） |
| 业务实体 | `{实体}` | `Item`（转换后） |

## 为什么禁止 import

这是 TypeScript 的基本机制，与使用什么库无关：

```typescript
// ❌ 错误示例：一旦有 import，文件变为模块声明
import type { ExternalType } from 'some-library'

declare namespace MyModule {
  type MyType = {
    field: ExternalType  // 需要 import
  }
}

// 结果：MyModule.MyType 不再全局可用，必须显式导入才能使用
```

```typescript
// ✅ 正确示例：纯全局声明，无 import
declare namespace MyModule {
  type MyType = {
    field: string  // 手动定义，不依赖外部类型
  }
}

// 结果：MyModule.MyType 在整个项目中全局可用，无需导入
```

## 常见场景处理

| 场景 | 错误做法 | 正确做法 |
|------|----------|----------|
| 使用第三方库类型 | `import type { LibType }` | 手动定义对应的 type |
| 使用工具类型 | `import type { Utility }` | 在 `src/lib/types/` 中定义并导出 |
| 引用其他模块类型 | `import type { OtherType }` | 通过命名空间引用：`OtherModule.Type` |
| Schema 推导类型 | `import { z }; type T = z.infer<...>` | 手动定义 type，与 Schema 分离 |

## 使用方式

```typescript
// 无需导入，直接使用
const result: Material.ListResponse = { ... }

// 在组件 Props 中使用
type MyComponentProps = {
  data: Material.Item
}

// 在函数参数中使用
function handleData(data: Material.CreateRequest) { ... }
```
