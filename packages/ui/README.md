# @kkfive/ui

基础 UI 控件包：shadcn 二次封装 + 自实现控件 + 设计 token + 基础 hook。不含 antd。

## 作用
- **基础控件**：Button、Input、Card、Dialog、Sheet、Drawer、Tooltip、ScrollArea、Separator、Sidebar、Skeleton、MethodBadge、StatusBadge、Icon。
- **基础 hook**：`use-mobile`。
- **工具**：`cn`（classname 合并）。

## 红线
- **不含 antd**：antd 由各 app 按需安装，业务代码直接用 antd，不在此包封装。
- React / react-dom 走 peerDependencies。
- 不含业务逻辑、不依赖 contracts / biz。

## 消费方式
业务代码**直接消费**，不做 re-export 透传层（透传即 anti-pattern）：
```ts
import { Button } from '@kkfive/ui/components/button'
import { useIsMobile } from '@kkfive/ui/hooks/use-mobile'
import { cn } from '@kkfive/ui/utils/cn'
```

仅当存在真实加工（改默认 props / 限制 API / 注入主题 / 组合多控件）时才在 app 内封装，且封装必须含实现，不做纯 re-export。
