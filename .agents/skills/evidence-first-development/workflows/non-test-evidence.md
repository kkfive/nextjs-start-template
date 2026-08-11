# Non-Test Evidence Workflow

普通单元测试不是所有任务的有效证据，但流程仍保持“先失败、后成功”。

## 可选证据

- CI / Turbo / workspace / architecture-policy：最小 fixture、临时仓库或真实命令。
- build / 类型 / 配置：修改前可重复的失败构建、类型错误或配置探针。
- 视觉 / 响应式 / 无障碍：真实浏览器步骤、语义断言、截图或审计结果。
- 性能：固定输入、环境、warm-up 与阈值的 benchmark。
- 外部系统：隔离的 contract probe 或 sandbox，不依赖不可控生产环境。

## 执行

1. 定义成功/失败的客观 oracle、环境和命令/步骤。
2. 在生产实现前执行，保存失败原因；无法制造失败时说明这是 characterization 或预防性验证，不伪称 RED。
3. 修改实现后以相同 oracle 重跑并取得成功。
4. 再运行相关 fixture、workspace、消费者和全局门禁。
5. 由与实现独立的观察者复核视觉、产品判断和其他机器无法可靠裁决的结果。

禁止用文档描述、正则命中、操作时间戳或 AI 自述替代真实行为证据。
