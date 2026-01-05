import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'

const MobileDrawer = dynamic(() => import('@/components/mobile-drawer').then(mod => mod.MobileDrawer))
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="lg:[--sidebar-width:16rem]! xl:[--sidebar-width:18rem]!">
        <AppSidebar />
      </div>

      <main className="relative flex max-h-screen w-full flex-1 flex-col bg-white" vaul-drawer-wrapper="">
        <header className="sticky inset-x-0 top-0 z-10 mx-auto flex h-12 w-full shrink-0 items-center overflow-hidden border-b bg-white text-sm font-medium lg:hidden">
          <div className="md:hidden">
            <MobileDrawer />
          </div>
        </header>
        <ScrollArea className="scrollable-area relative box-border flex w-full max-w-full flex-1 flex-col overflow-hidden">
          {children}
        </ScrollArea>
      </main>

    </SidebarProvider>
  )
}

export const viewport = {
  themeColor: 'white',
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: 'no',
  minimumScale: 1,
  maximumScale: 1,
}
