import { AppSidebarGroup } from '@/app/menu/app-sidebar-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sidebar } from '@/components/ui/sidebar'

export function AppSidebar() {
  return (
    <Sidebar>
      <ScrollArea className="h-screen w-full">
        <div className="h-20 w-full rounded-md bg-red-500">card</div>
        <AppSidebarGroup />
      </ScrollArea>
    </Sidebar>
  )
}
