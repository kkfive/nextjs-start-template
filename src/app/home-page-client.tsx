'use client'

import type { FeatureCardConfig } from '@/config/site-features'
import type { TechStackItem } from '@/lib/tech-stack'
import { motion } from 'framer-motion'
import { FeatureCard } from '@/components/home/feature-card'
import { HeroSection } from '@/components/home/hero-section'
import { siteFeatures } from '@/config/site-features'

interface HomePageClientProps {
  techStack: TechStackItem[]
}

export function HomePageClient({ techStack }: HomePageClientProps) {
  // 首屏内容限制：仅显示 priority >= 4 的功能
  const highPriorityFeatures = siteFeatures
    .map(category => ({
      ...category,
      items: category.items.filter(item => item.priority >= 4),
    }))
    .filter(category => category.items.length > 0)

  // 低优先级功能（用于"查看更多"）
  const lowPriorityFeatures = siteFeatures
    .map(category => ({
      ...category,
      items: category.items.filter(item => item.priority < 4),
    }))
    .filter(category => category.items.length > 0)

  // 按优先级排序功能
  const sortByPriority = (items: FeatureCardConfig[]) =>
    [...items].sort((a, b) => b.priority - a.priority)

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const categoryTitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Hero Section */}
      <HeroSection
        title="Next.js Start Template"
        subtitle="现代化 Next.js 启动模板，集成领域驱动架构，助力快速项目开发"
        techStack={techStack.map(item => ({
          name: item.technology,
          color: 'bg-blue-50 text-blue-700',
        }))}
        ctaButtons={[
          { text: '浏览代码', href: 'https://github.com/kkfive/nextjs-start-template', variant: 'default' },
          { text: '查看示例', href: '/demo', variant: 'outline' },
        ]}
      />

      {/* Features Section */}
      <div id="features" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-4 text-center text-3xl font-bold text-neutral-900 sm:text-4xl">
          功能演示
        </h2>
        <p className="mb-16 text-center text-lg text-neutral-600">
          探索模板提供的各种功能和最佳实践示例
        </p>

        {/* 高优先级功能（首屏） */}
        <div className="space-y-16">
          {highPriorityFeatures.map(category => (
            <motion.div
              key={category.category}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={containerVariants}
            >
              {/* 分类标题 */}
              <motion.div
                className="mb-8 flex items-center gap-3"
                variants={categoryTitleVariants}
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">{category.category}</h3>
              </motion.div>

              {/* 功能卡片网格 */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortByPriority(category.items).map((item, itemIndex) => (
                  <FeatureCard
                    key={item.href}
                    title={item.name}
                    description={item.description}
                    icon={category.icon}
                    href={item.href}
                    category={category.category}
                    priority={item.priority}
                    delay={itemIndex * 0.1}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 低优先级功能（渐进式展示） */}
        {lowPriorityFeatures.length > 0 && (
          <div className="mt-20 space-y-16">
            <div className="border-t border-neutral-200 pt-16">
              <h3 className="mb-12 text-center text-2xl font-bold text-neutral-900">
                更多功能
              </h3>

              {lowPriorityFeatures.map(category => (
                <motion.div
                  key={category.category}
                  className="mb-16 last:mb-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={containerVariants}
                >
                  {/* 分类标题 */}
                  <motion.div
                    className="mb-8 flex items-center gap-3"
                    variants={categoryTitleVariants}
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                      {category.icon}
                    </div>
                    <h4 className="text-xl font-bold text-neutral-900">{category.category}</h4>
                  </motion.div>

                  {/* 功能卡片网格 */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortByPriority(category.items).map((item, itemIndex) => (
                      <FeatureCard
                        key={item.href}
                        title={item.name}
                        description={item.description}
                        icon={category.icon}
                        href={item.href}
                        category={category.category}
                        priority={item.priority}
                        delay={itemIndex * 0.1}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
