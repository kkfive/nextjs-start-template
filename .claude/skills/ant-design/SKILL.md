---
name: ant-design
description: Ant Design 6.x 组件选择、主题配置、CSS-in-JS/SSR 设置指南。用于构建或审查 antd UI、配置 ConfigProvider/主题、解决 Ant Design 在 React/Next.js/Umi/Vite 中的 UI/SSR/性能问题。
user-invocable: true
---

# Ant Design

## 重要规则

**API 查询要求**: 使用任何 Ant Design 组件前，**必须先通过网络查询该组件的最新 API 文档**。绝对不可以假设 API 存在就不去搜索。

**查询方式**:
1. 使用 WebFetch 工具访问 `https://ant.design/components/{component}-cn`
2. 或使用 WebSearch 搜索 "antd {component} API 文档"
3. 确认组件支持的 props、styles、classNames 等 API

**示例**:
```
# 使用 Button 组件前
WebFetch("https://ant.design/components/button-cn", "提取 Button 组件的所有 API 属性")

# 使用 Form 组件前
WebSearch("antd Form API 文档 2026")
```

## S - Scope（范围）
- Target: antd@^6 配合 React 18-19（基于官方文档）
- Cover: 核心组件、主题/Token、CSS-in-JS、SSR、无障碍、性能模式
- Avoid: Pro 路由/布局和 ProComponents（使用 ant-design-pro skill）
- Avoid: AI 聊天/Copilot UI（使用 ant-design-x skill）

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
核心 v6 | 版本范围、迁移说明、主题/SSR 概览 | `references/antd-v6.md`
遗留 v5 | 现有 v5 项目和迁移防护 | `references/antd-v5.md`
Form 高级 | 动态表单、依赖关系、验证性能 | `references/form-advanced.md`
Table 高级 | 排序/过滤/虚拟化模式 | `references/table-advanced.md`
Upload 高级 | 受控上传、customRequest、边缘情况 | `references/upload-advanced.md`
Select 高级 | 远程搜索、标签、渲染和无障碍 | `references/select-advanced.md`
Tree 高级 | 异步加载、checkStrictly、虚拟化 | `references/tree-advanced.md`

## P - Process（流程）
1. **识别应用上下文**: 产品类型、渲染模式（CSR/SSR/streaming）、主题深度、数据规模
2. **设置 Providers**: 在应用根部使用单个 ConfigProvider；SSR 或严格样式顺序时添加 StyleProvider
3. **选择组件模式**: Form 作为数据源；Table 使用稳定的 rowKey；Modal/Drawer 使用 destroyOnClose 处理状态
4. **规划主题**: 全局 tokens → 组件 tokens → 别名 tokens；避免全局 .ant-* 覆盖
5. **遇到复杂情况**: 打开上述索引中对应的 `Reference` 文件
6. **验证无障碍/性能**: 键盘/焦点、虚拟化、记忆化列、节流更新

## O - Output（输出）
- 推荐组件和布局原语，附带简短理由
- 提供 token/主题策略和所需的最小 provider 设置
- 指出 SSR、性能和无障碍风险，提供具体缓解措施
- 包含验收或回归测试的简短清单

## 快速参考

### 常见模式

```typescript
// 模式 1: ConfigProvider 全局配置
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

<ConfigProvider
  locale={zhCN}
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 4,
    },
    components: {
      Button: {
        fontWeight: 600,
      },
    },
  }}
>
  <App />
</ConfigProvider>

// 模式 2: Form 作为数据源
// 注意: 所有 antd 组件必须通过 @/components/ui/* 导入
// 详见 /coding-standards 中的 UI 导入规范
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

<Form
  form={form}
  onFinish={handleSubmit}
  initialValues={{ username: '' }}
>
  <Form.Item name="username" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
  <Button htmlType="submit">提交</Button>
</Form>

// 模式 3: Table 虚拟化（大数据）
// 注意: 所有 antd 组件必须通过 @/components/ui/* 导入
import { Table } from '@/components/ui/table'

<Table
  dataSource={data}
  columns={columns}
  rowKey="id"
  virtual
  scroll={{ y: 500 }}
/>
```

### 反模式

| ❌ 不要 | ✅ 应该 | 原因 |
|---------|---------|------|
| 直接覆盖 `.ant-btn` 类名 | 使用 ConfigProvider theme | 全局覆盖难以维护，易冲突 |
| 不设置 Table rowKey | 使用稳定的 `rowKey="id"` | 导致渲染性能问题和状态错乱 |
| Modal 不使用 destroyOnClose | `<Modal destroyOnClose>` | 状态残留，导致数据错误 |
| 假设 API 存在 | 先查询官方文档 | API 可能变更或不存在 |
| 在 SSR 中不使用 StyleProvider | 添加 StyleProvider | 样式顺序错乱，导致样式失效 |

## 相关 Skills

- /styling-system: Ant Design 样式自定义规范（5 级优先级体系）
- /coding-standards: UI 组件导入规范（必须通过 `@/components/ui/*`）
- /nextjs-app-router-patterns: Next.js SSR 配置和 Server Components
