'use client'

import { CommandIcon } from 'lucide-react'

import { AppSidebarGroup } from '@/app/menu/app-sidebar-group'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { SidebarContent } from '@/components/ui/sidebar'

export function MobileDrawer() {
  return (
    <Drawer shouldScaleBackground>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" title="Toggle drawer">
          <CommandIcon size={16} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle></DrawerTitle>
            {/* <DrawerDescription>Set your daily activity goal.</DrawerDescription> */}
          </DrawerHeader>
          <ScrollArea className="h-128 w-full">
            <SidebarContent>
              <AppSidebarGroup isDrawer />
            </SidebarContent>
            <ScrollBar orientation="vertical" />
          </ScrollArea>

        </div>
      </DrawerContent>
    </Drawer>
  )
}
