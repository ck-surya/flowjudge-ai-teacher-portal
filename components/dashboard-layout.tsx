'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useTeacher } from '@/components/teacher-provider'
import { RequestState } from '@/components/request-state'

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
  const { data: teacher, loading, error, retry } = useTeacher()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (!teacher) {
    return <main className="min-h-screen bg-background p-6">
      <RequestState loading={loading} error={error} onRetry={retry} />
    </main>
  }

  return (
    <div className="flex h-dvh bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:p-3 focus:rounded-lg">Skip to content</a>
      <Sidebar teacherName={teacher?.name} isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header title={title} subtitle={subtitle} teacher={teacher} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-4 md:p-6 md:max-w-7xl mx-auto w-full">
          <RequestState loading={loading} error={error} onRetry={retry} />
          {teacher && children}
        </main>
      </div>
    </div>
  )
}
