'use client'
import type { ReactNode } from 'react'
import { cn } from '@kkfive/ui'
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@kkfive/ui/components/sidebar'
import { usePathname } from 'next/navigation'
import { Link } from '@/components/ui/link'

export function NavigationLink({ title, url, icon, badge, children }:
{
  title: string
  url: string
  icon: ReactNode
  key?: string
  badge?: ReactNode | string
  children?: ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === url

  const themeClass = cn(
    'flex items-center justify-between',
    isActive ? '[--sidebar-accent-foreground:white] [--sidebar-accent:#3b3b3b]' : '',
  )

  return (

    <SidebarMenuItem className={themeClass}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="transition hover:bg-gray-200"
      >
        {children || (
          <Link className="transition" href={url}>
            {icon}
            <span>{title}</span>
          </Link>
        )}

      </SidebarMenuButton>
      <SidebarMenuBadge>{badge}</SidebarMenuBadge>
    </SidebarMenuItem>

  )
}
