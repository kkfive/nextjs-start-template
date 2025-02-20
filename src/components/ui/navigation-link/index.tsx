'use client'
import type { ReactNode } from 'react'
import { Link } from '@/components/ui/link'
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

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
    'flex justify-between items-center',
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
