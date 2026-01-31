'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export interface TechBadge {
  name: string
  color: string
  icon?: React.ReactNode
}

export interface CTAButton {
  text: string
  href: string
  variant?: 'default' | 'outline' | 'secondary'
}

export interface HeroSectionProps {
  title: string
  subtitle: string
  techStack: TechBadge[]
  ctaButtons?: CTAButton[]
}

export function HeroSection({
  title,
  subtitle,
  techStack,
  ctaButtons,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-neutral-50 px-4 py-12 sm:py-16 md:py-20 lg:py-24">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
        }}
      >
        {/* Hero Content */}
        <div className="text-center">
          {/* Title with gradient */}
          <h1 className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 sm:text-xl md:text-2xl">
            {subtitle}
          </p>

          {/* Tech Stack Badges */}
          {techStack.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              {techStack.map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-transform hover:scale-105 ${tech.color}`}
                >
                  {tech.icon && <span className="flex-shrink-0">{tech.icon}</span>}
                  <span>{tech.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          {ctaButtons && ctaButtons.length > 0 && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {ctaButtons.map((button, index) => (
                <Button
                  key={`${button.text}-${index}`}
                  variant={button.variant || 'default'}
                  size="lg"
                  asChild
                >
                  <Link href={button.href}>{button.text}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
