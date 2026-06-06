# Level 5: SCSS 覆盖（最后手段）

## 适用（仅以下三种）

1. 组件内部元素无法通过 API 访问
2. 自定义伪元素（`::before` / `::after`）
3. 自定义复杂伪类组合，且 API 不支持

## 硬规范

- **必须 `:global()`** 包裹 antd 类名（避免 CSS Modules 重命名）
- **必须注释覆盖原因**
- **避免 `!important`**
- **颜色用 CSS Variables**
- **选择器作用域到组件根**（不要直接全局 `.ant-xxx`）

## 模板

```scss
// src/components/domain/material/material-uploader.scss

.material-uploader {
  // 覆盖原因：antd Upload 拖拽区域无法通过 API 自定义边框样式
  :global(.ant-upload-drag) {
    border: 2px dashed var(--platform-secondary);
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--platform-primary);
      background-color: rgba(59, 130, 246, 0.05);
    }
  }

  // 覆盖原因：上传图标颜色需要与主题联动，组件 API 不支持
  :global(.ant-upload-drag-icon) {
    color: var(--platform-primary);
  }
}
```

```tsx
import './material-uploader.scss'

export function MaterialUploader() {
  return (
    <div className="material-uploader">
      <Upload.Dragger>上传文件</Upload.Dragger>
    </div>
  )
}
```

## 反例

```scss
// ❌ 全局污染 + 无注释 + 硬编码 + !important
.ant-upload-drag {
  border: 2px dashed #3b82f6 !important;
}
.ant-upload-drag:hover {
  border-color: #1e40af !important;
  background-color: #eff6ff !important;
}
```

## 升级触发

如果一个组件你写了 3+ 处 `:global(.ant-xxx)`：
- 检查 antd 是否在新版加了对应 `styles` / `classNames`（升级 antd 版本可能就够了）
- 如果是项目通用需求 → 升级到 ConfigProvider components

## 检查

- [ ] 每个 `:global(.ant-*)` 都有"覆盖原因"注释
- [ ] 选择器作用域到组件根 class
- [ ] 颜色全用 Variables
- [ ] 没有 `!important`
