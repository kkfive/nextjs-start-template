'use client'

import Link from 'next/link'
import {
  LucideGithub,
  LucideLayers,
} from '@/components/ui/icon'

type FooterLink = {
  href: string
  label: string
  external?: boolean
}

type FooterLinkGroup = {
  title: string
  links: FooterLink[]
}

const footerLinks: FooterLinkGroup[] = [
  {
    title: '导航',
    links: [
      { href: '/', label: '首页' },
      { href: '/demo', label: '演示' },
    ],
  },
  {
    title: '功能演示',
    links: [
      { href: '/demo/request/hitokoto', label: 'HTTP 请求' },
      { href: '/demo/forms/form-validation', label: '表单验证' },
      { href: '/demo/state/zustand-mouse', label: '状态管理' },
    ],
  },
  {
    title: '相关链接',
    links: [
      { href: 'https://github.com/kkfive/nextjs-start-template', label: 'GitHub', external: true },
      { href: 'https://nextjs.org', label: 'Next.js', external: true },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <LucideLayers className="size-3.5" />
              </div>
              <span className="text-sm font-semibold">
                Next.js Template
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              现代化 Next.js 启动模板，
              <br />
              集成领域驱动架构
            </p>
            <p className="mt-4 text-xs text-muted-foreground/60">
              MIT License · 基于 Next.js 构建
            </p>
          </div>

          {/* Link Groups */}
          {footerLinks.map(group => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
              <ul className="mt-3 space-y-2">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground/60">
            2026 Next.js Start Template
          </p>
          <Link
            href="https://github.com/kkfive/nextjs-start-template"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            <LucideGithub className="size-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
