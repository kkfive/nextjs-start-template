import { AlertTriangle, Database, FileText, Palette, Store } from 'lucide-react'
import { FeatureCard } from '@/components/home/feature-card'
import { HeroSection } from '@/components/home/hero-section'
import { getTechStackFromReadme } from '@/lib/tech-stack'

const examples = [
  {
    category: 'UI',
    icon: <Palette className="size-6" />,
    items: [
      { name: 'Color Palette', href: '/example/color', description: 'Tailwind CSS color system demonstration' },
    ],
  },
  {
    category: 'Forms',
    icon: <FileText className="size-6" />,
    items: [
      { name: 'Form Validation', href: '/example/form', description: 'react-hook-form + zod validation' },
    ],
  },
  {
    category: 'Data Fetching',
    icon: <Database className="size-6" />,
    items: [
      { name: 'Hitokoto API', href: '/example/request/hitokoto', description: 'External API request with ky' },
      { name: 'Success Response', href: '/example/success', description: 'Successful API response handling' },
    ],
  },
  {
    category: 'Error Handling',
    icon: <AlertTriangle className="size-6" />,
    items: [
      { name: '400 Bad Request', href: '/example/request/error/400', description: 'Client error handling' },
      { name: '401 Unauthorized', href: '/example/request/error/401', description: 'Authentication error handling' },
      { name: 'Business Error', href: '/example/request/error/bussiness', description: 'Custom business logic error' },
    ],
  },
  {
    category: 'State Management',
    icon: <Store className="size-6" />,
    items: [
      { name: 'Zustand Store', href: '/example/zustand', description: 'Global state with Zustand' },
    ],
  },
]

export default async function HomePage() {
  const techStack = await getTechStackFromReadme()

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <HeroSection
        title="Next.js Start Template"
        subtitle="现代化 Next.js 启动模板，集成领域驱动架构，助力快速项目开发"
        techStack={techStack.map(item => ({
          name: item.technology,
          color: 'bg-blue-50 text-blue-700',
        }))}
        ctaButtons={[
          { text: '查看示例', href: '/example', variant: 'default' },
          { text: '浏览代码', href: 'https://github.com/kkfive/nextjs-start-template', variant: 'outline' },
        ]}
      />

      {/* Features Grid */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-4 text-center text-3xl font-bold text-neutral-900">功能演示</h2>
        <p className="mb-12 text-center text-lg text-neutral-600">
          探索模板提供的各种功能和最佳实践示例
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examples.flatMap((category, catIndex) =>
            category.items.map((item, itemIndex) => (
              <FeatureCard
                key={item.href}
                title={item.name}
                description={item.description}
                icon={category.icon}
                href={item.href}
                category={category.category}
                delay={catIndex * 0.1 + itemIndex * 0.05}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}

export const runtime = 'nodejs'
