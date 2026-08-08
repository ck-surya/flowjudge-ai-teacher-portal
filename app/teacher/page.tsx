'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Activity, BarChart3, Users, BookMarked, CheckCircle2 } from 'lucide-react'
import { getDashboardStats, getTeacher } from '@/lib/teacherService'

export default function Dashboard() {
  const [teacherName, setTeacherName] = useState('Dr. Sarah Johnson')
  const [stats, setStats] = useState({ totalClasses: 0, totalStudents: 0, activeModules: 0, totalSubmissions: 0, pendingReviews: 0 })

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [me, dashboard] = await Promise.all([getTeacher(), getDashboardStats()])
      if (!mounted) return
      setTeacherName(me.name)
      setStats(dashboard)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const recentActivity = [
    {
      action: 'Student submitted Fibonacci problem',
      student: 'Alex Chen',
      class: 'Programming Fundamentals',
      time: '2 hours ago',
      href: '/submissions',
    },
    {
      action: 'Student requested teacher review',
      student: 'Maria Garcia',
      class: 'Advanced Algorithms',
      time: '4 hours ago',
      href: '/review-requests',
    },
    {
      action: 'Student completed Arrays module',
      student: 'John Smith',
      class: 'Data Structures',
      time: '1 day ago',
      href: '/classes',
    },
    {
      action: 'New assignment created',
      student: 'Class',
      class: 'Web Development Basics',
      time: '2 days ago',
      href: '/classes',
    },
  ]

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${teacherName}`}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Classes" value={String(stats.totalClasses)} icon={BookMarked} color="primary" href="/classes" />
          <StatCard title="Total Students" value={String(stats.totalStudents)} icon={Users} color="blue" href="/classes" />
          <StatCard title="Active Modules" value={String(stats.activeModules)} icon={Activity} color="green" href="/classes" />
          <StatCard title="Total Submissions" value={String(stats.totalSubmissions)} icon={BarChart3} color="amber" href="/submissions" />
          <StatCard title="Pending Reviews" value={String(stats.pendingReviews)} icon={CheckCircle2} color="rose" href="/review-requests" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
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
          <Link href="/teacher/classes" className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-primary mb-2">{stats.totalClasses}</div>
            <p className="text-sm text-foreground font-medium">Manage Classes</p>
            <p className="text-xs text-muted-foreground">View and manage all classes</p>
          </Link>
          <Link href="/teacher/reviews" className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-rose-600 mb-2">{stats.pendingReviews}</div>
            <p className="text-sm text-foreground font-medium">Review Requests</p>
            <p className="text-xs text-muted-foreground">Pending teacher queue</p>
          </Link>
          <Link href="/teacher/submissions" className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSubmissions}</div>
            <p className="text-sm text-foreground font-medium">All Submissions</p>
            <p className="text-xs text-muted-foreground">Search and filter submissions</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
