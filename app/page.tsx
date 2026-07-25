'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Activity, BarChart3, Users, BookMarked, CheckCircle2 } from 'lucide-react'

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back, Dr. Sarah Johnson"
    >
      <div className="space-y-8">
        {/* Top Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Classes"
            value="4"
            icon={BookMarked}
            color="primary"
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Total Students"
            value="184"
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Modules"
            value="21"
            icon={Activity}
            color="green"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Total Submissions"
            value="1,247"
            icon={BarChart3}
            color="amber"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Reviews"
            value="34"
            icon={CheckCircle2}
            color="rose"
            trend={{ value: 3, isPositive: false }}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              {
                action: 'Student submitted Fibonacci problem',
                student: 'Alex Chen',
                class: 'Programming Fundamentals',
                time: '2 hours ago',
              },
              {
                action: 'Student requested teacher review',
                student: 'Maria Garcia',
                class: 'Advanced Algorithms',
                time: '4 hours ago',
              },
              {
                action: 'Student completed Arrays module',
                student: 'John Smith',
                class: 'Data Structures',
                time: '1 day ago',
              },
              {
                action: 'New assignment created',
                student: 'Class',
                class: 'Web Development Basics',
                time: '2 days ago',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.student} • {item.class}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/classes"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer"
          >
            <div className="text-3xl font-bold text-primary mb-2">4</div>
            <p className="text-sm text-foreground font-medium">Manage Classes</p>
            <p className="text-xs text-muted-foreground">View and manage all classes</p>
          </a>
          <a
            href="/review-requests"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer"
          >
            <div className="text-3xl font-bold text-rose-600 mb-2">34</div>
            <p className="text-sm text-foreground font-medium">Review Requests</p>
            <p className="text-xs text-muted-foreground">Pending student submissions</p>
          </a>
          <a
            href="/submissions"
            className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all text-center cursor-pointer"
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">1.2K</div>
            <p className="text-sm text-foreground font-medium">All Submissions</p>
            <p className="text-xs text-muted-foreground">Search and filter submissions</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
