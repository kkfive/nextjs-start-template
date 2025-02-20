import { AppSidebarGroup } from '@/app/menu/app-sidebar-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sidebar } from '@/components/ui/sidebar'

export function AppSidebar() {
  return (
    <Sidebar>
      <ScrollArea className="w-full h-screen">
        <div className="w-full h-20 bg-red-500 rounded-md">card</div>
        <AppSidebarGroup />
      </ScrollArea>
    </Sidebar>
  )
}
