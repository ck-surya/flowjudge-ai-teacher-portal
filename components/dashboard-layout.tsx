'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function DashboardLayout({
  children,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto p-4 md:p-6 md:max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
