---
name: styling-system
description: Ant Design 样式自定义规范 - 5 级优先级体系（ConfigProvider → CSS Variables → 组件 API → Tailwind → SCSS）。用于样式调整、主题切换、解决样式冲突。
user-invocable: true
---

# Styling System

## S - Scope
- Target: Ant Design 5.x+ 样式自定义
- Cover: ConfigProvider、CSS Variables、组件 API、Tailwind、SCSS 覆盖
- Avoid: 直接覆盖 antd 类名、使用 `!important`、硬编码颜色值

### `Reference` 索引

Topic | Description | `Reference`
--- | --- | ---
样式优先级 | 5 级优先级体系、决策流程、实际案例 | `references/styling-priority.md`

## P - Process
1. **识别需求**：确定样式调整的范围（全局/组件类/单个实例）
2. **选择优先级**：
   - 全局样式 → ConfigProvider (theme.token)
   - 组件类样式 → ConfigProvider (theme.components)
   - 主题切换 → CSS Variables (--platform-*, data-theme)
   - 单个实例 → 组件 API props (style/styles/classNames)
   - 快速调整 → className + Tailwind
   - 最后手段 → SCSS 覆盖（需注释）
3. **查阅文档**：使用组件 API 前先查阅 Ant Design 官方文档
4. **验证效果**：确保样式在主题切换、响应式场景下正常工作

## O - Output
- 推荐样式方案及优先级选择理由
- 提供代码示例（ConfigProvider 配置、CSS Variables 定义、组件 API 使用）
- 指出反模式和潜在问题
- 包含验证清单（主题切换、响应式、版本兼容性）

## 5 级优先级

```
1. ConfigProvider (全局主题配置)
   ├─ theme.token (Design Token)
   └─ theme.components (组件级主题)

2. CSS Variables (设计系统 Token)
   ├─ 平台主题变量 (--platform-*)
   ├─ 业务主题变量 (--auth-*, --dashboard-*)
   └─ 主题变体 (data-theme)

3. 组件 API props (组件实例配置)
   ├─ style (内联样式)
   ├─ styles (多部位样式，Ant Design 5.x+)
   └─ classNames (多部位类名，Ant Design 5.x+)

4. className + Tailwind (工具类样式)
   ├─ Tailwind 工具类
   ├─ CSS Variables 引用 (var(--platform-primary))
   └─ 响应式修饰符

5. SCSS 覆盖 (最后手段)
   ├─ 组件内部元素无法通过 API 访问
   ├─ 伪元素、伪类样式
   └─ 必须添加注释说明覆盖原因
```

## 决策流程

```
需要自定义样式
    |
    ├─ 影响所有组件？
    |   └─ YES → ConfigProvider (theme.token)
    |
    ├─ 影响某类组件的所有实例？
    |   └─ YES → ConfigProvider (theme.components)
    |
    ├─ 需要主题切换/多变体？
    |   └─ YES → CSS Variables (--platform-*, data-theme)
    |
    ├─ 单个组件实例？
    |   ├─ 查阅组件 API 文档
    |   ├─ 有 style/styles/classNames API？
    |   |   └─ YES → 使用组件 API props
    |   └─ NO → 继续
    |
    ├─ 常见样式调整（间距/尺寸/颜色）？
    |   └─ YES → className + Tailwind
    |
    └─ 组件内部元素/伪元素？
        └─ YES → SCSS 覆盖 (添加注释说明原因)
```

## 反模式警告

| 反模式 | 问题 | 正确做法 |
|--------|------|----------|
| ❌ 直接覆盖 antd 类名 | 脆弱，版本升级易失效 | 先查阅组件 API 文档 |
| ❌ 使用 `!important` | 破坏样式优先级 | 提高选择器权重或使用 CSS Variables |
| ❌ 硬编码颜色值 | 无法主题切换 | 使用 CSS Variables |
| ❌ 无注释的样式覆盖 | 后续维护困难 | 添加注释说明覆盖原因 |
