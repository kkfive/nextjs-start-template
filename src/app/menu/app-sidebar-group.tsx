import type { ReactNode } from 'react'
import { DrawerClose } from '@/components/ui/drawer'
import { Link } from '@/components/ui/link'
import { NavigationLink } from '@/components/ui/navigation-link'
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar'
import { ExternalLink, Home, Inbox, WandSparkles } from 'lucide-react'

interface LinkItems {
  title: string
  url: string
  icon: ReactNode
  badge?: ReactNode | string
}

// Menu items.
const items: Array<LinkItems> = [
  {
    title: 'Home',
    url: '/menu',
    icon: <Home />,
  },
  {
    title: 'children',
    url: '/menu/children',
    icon: <Inbox />,
  },
  {
    title: 'stack',
    url: '/menu/stack',
    icon: <WandSparkles />,
  },
]
const externalItems: Array<LinkItems> = [
  {
    title: '百度',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度1',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度2',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度3',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度4',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度5',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度6',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度7',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度8',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度9',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度10',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度11',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度12',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度13',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度14',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度15',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度16',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度17',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度18',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度19',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
  {
    title: '百度20',
    url: 'https://www.baidu.com',
    icon: <Home />,
    badge: <ExternalLink size="12" />,
  },
]

export function AppSidebarGroup({ isDrawer }: { isDrawer?: boolean }) {
  return (
    <SidebarContent>

      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>

            {items.map(item => (
              <NavigationLink
                key={item.title}
                title={item.title}
                url={item.url}
                icon={item.icon}
                badge="24"
              >
                {isDrawer && (
                  <DrawerClose asChild>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </DrawerClose>
                )}
              </NavigationLink>
            ))}

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <hr />
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {externalItems.map(item => (
              <NavigationLink
                key={item.title}
                title={item.title}
                url={item.url}
                icon={item.icon}
                badge={item.badge}
              >
                {isDrawer && (
                  <DrawerClose asChild>
                    <Link href={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </DrawerClose>
                )}
              </NavigationLink>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
