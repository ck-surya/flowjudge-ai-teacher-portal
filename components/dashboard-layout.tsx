'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { getTeacher } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'
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
  const { data: teacher, loading, error, retry } = useRequest(getTeacher)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (!teacher) {
    return <main className="min-h-screen bg-background p-6">
      <RequestState loading={loading} error={error} onRetry={retry} />
    </main>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar teacherName={teacher?.name} isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Header title={title} subtitle={subtitle} teacher={teacher} />
        <main className="flex-1 overflow-auto p-4 md:p-6 md:max-w-7xl mx-auto w-full">
          <RequestState loading={loading} error={error} onRetry={retry} />
          {teacher && children}
        </main>
      </div>
    </div>
  )
}
