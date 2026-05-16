import React from 'react'
import { SidebarProvider, useSidebar } from '../context/SidebarContext'
import { Outlet } from 'react-router'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  return (
    <div
      className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
        isExpanded || isHovered ? 'lg:pl-[290px]' : 'lg:pl-[90px]'
      } ${isMobileOpen ? 'pl-0' : ''}`}
    >
      <AppSidebar />
      <div className="min-w-0">
        <AppHeader />
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const AppLayout: React.FC = () => {
  return (
    <>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </>
  )
}

export default AppLayout
