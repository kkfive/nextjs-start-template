# Skill 模板

这是创建新 Claude Code skills 的模板。

## 目录结构

```
skill-name/
├── SKILL.md           # 主文件（必需）
├── README.md          # 概览文档（必需）
├── references/        # 详细参考文档（可选）
│   ├── topic1.md
│   └── topic2.md
└── examples/          # 代码示例（可选）
    └── example1.tsx
```

## SPOR 框架

所有 skills 必须遵循 SPOR 结构：

- **S - Scope（范围）**: 覆盖和不覆盖的内容
- **P - Process（流程）**: 分步骤的工作流程
- **O - Output（输出）**: 预期结果和质量标准
- **R - References（参考）**: 详细文档链接

## 使用方法

1. 复制此模板到 `.claude/skills/your-skill-name/`
2. 填写 SKILL.md 的内容
3. 根据需要添加 references/ 目录
4. 更新 CLAUDE.md 引用你的 skill

## 最佳实践

- 保持 SKILL.md 简洁（< 500 行）
- 将详细内容移到 references/
- 包含代码示例
- 列出反模式
- 引用相关 skills

## 语言规范

- **主要语言**: 中文
- **技术术语**: 保留英文（如 React、TypeScript、API）
- **代码注释**: 使用中文
- **变量名**: 使用英文
