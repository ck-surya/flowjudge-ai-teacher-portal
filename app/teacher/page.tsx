'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Activity, BarChart3, Users, BookMarked, CheckCircle2 } from 'lucide-react'
import { RequestState } from '@/components/request-state'
import { useRequest } from '@/lib/use-request'
import { getDashboardStats, listClasses } from '@/lib/teacherService'
import { useTeacher } from '@/components/teacher-provider'

export default function Dashboard() {
  const [classId, setClassId] = useState('')
  const classes = useRequest(listClasses)
  const { data: teacher } = useTeacher()
  const { data: stats, loading, error, retry } = useRequest(() => getDashboardStats(classId || undefined), [classId])
  const teacherName = teacher?.name ?? ''
  const submissionsHref = `/submissions${classId ? `?${new URLSearchParams({ classId })}` : ''}`
  const reviewsHref = `/review-requests${classId ? `?${new URLSearchParams({ classId })}` : ''}`
  if (!stats) return <DashboardLayout title="Dashboard"><RequestState loading={loading} error={error} onRetry={retry} /></DashboardLayout>
  const recentActivity = stats.recentSubmissions.map(row => ({
    action: `${row.problemName} · ${row.verdict}`, student: row.studentName,
    class: row.className, time: new Date(row.submissionTime).toLocaleString(), href: `/submissions/${row.id}`,
  }))

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${teacherName}`}
    >
      <div className="space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <label>Dashboard class <select aria-label="Dashboard class" value={classId} onChange={e => setClassId(e.target.value)} className="ml-2 p-2 border border-border rounded-lg bg-card"><option value="">All classes</option>{classes.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
          <button onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh dashboard</button>
        </div>
        <RequestState error={error || classes.error} onRetry={() => { retry(); classes.retry() }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Classes" value={String(stats.totalClasses)} icon={BookMarked} color="primary" href="/classes" />
          <StatCard title="Total Students" value={String(stats.totalStudents)} icon={Users} color="blue" href={classId ? `/classes/${classId}#students` : '/classes'} />
          <StatCard title="Assigned Modules" value={String(stats.activeModules)} icon={Activity} color="green" href={classId ? `/classes/${classId}#modules` : '/classes'} />
          <StatCard title="Total Submissions" value={String(stats.totalSubmissions)} icon={BarChart3} color="amber" href={submissionsHref} />
          <StatCard title="Pending Reviews" value={String(stats.pendingReviews)} icon={CheckCircle2} color="rose" href={reviewsHref} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.evaluation).map(([status, count]) => <div key={status} className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground capitalize">{status}</p><p className="text-2xl font-semibold mt-1">{count}</p>
            <Link aria-label={`View ${status} submissions`} href={`/submissions?${new URLSearchParams({ status: status.toUpperCase(), ...(classId ? { classId } : {}) })}`} className="text-sm text-primary">View submissions</Link>
          </div>)}
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
            {recentActivity.map((item, idx) => (
              <Link href={item.href} key={idx} className="block group">
                <div className="flex items-start justify-between p-3 border-b border-border group-hover:bg-secondary/50 rounded-lg transition-colors">
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.student} • {item.class}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/classes" className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-primary mb-2">{stats.totalClasses}</div>
            <p className="text-sm text-foreground font-medium">Manage Classes</p>
            <p className="text-xs text-muted-foreground">View and manage all classes</p>
          </Link>
          <Link href={reviewsHref} className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-rose-600 mb-2">{stats.pendingReviews}</div>
            <p className="text-sm text-foreground font-medium">Review Requests</p>
            <p className="text-xs text-muted-foreground">Pending teacher queue</p>
          </Link>
          <Link href={submissionsHref} className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSubmissions}</div>
            <p className="text-sm text-foreground font-medium">All Submissions</p>
            <p className="text-xs text-muted-foreground">Search and filter submissions</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
