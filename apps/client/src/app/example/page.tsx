import type { Metadata } from 'next'
import { ExamplePageView } from '@/features/example'

export const metadata: Metadata = {
  title: 'Example',
}

// 路由只组合 feature：业务实现都在 src/features/example，本文件零逻辑。
// 接管本项目：删除本文件与 src/features/example 即完成示例剥离（或直接 pnpm reset）。
export default function Page() {
  return <ExamplePageView />
}
