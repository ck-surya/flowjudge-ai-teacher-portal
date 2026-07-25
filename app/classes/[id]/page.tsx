'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { Tabs } from '@/components/tabs'
import { ModuleCard } from '@/components/module-card'
import { Users, BookOpen, Code2, FileText, AlertCircle } from 'lucide-react'

const mockClass = {
  id: '1',
  name: 'Programming Fundamentals',
  code: 'PF-CSEA-26',
  teacher: 'Dr. Sarah Johnson',
  totalStudents: 45,
  totalModules: 5,
  totalProblems: 42,
  totalSubmissions: 387,
  pendingReviews: 12,
}

const mockModules = [
  {
    id: '1',
    classId: '1',
    name: 'Loops',
    description: 'Learn iterative programming concepts',
    problemCount: 8,
    completionPercentage: 70,
  },
  {
    id: '2',
    classId: '1',
    name: 'Arrays',
    description: 'Master array data structures',
    problemCount: 7,
    completionPercentage: 65,
  },
  {
    id: '3',
    classId: '1',
    name: 'Functions',
    description: 'Function fundamentals and best practices',
    problemCount: 9,
    completionPercentage: 80,
  },
  {
    id: '4',
    classId: '1',
    name: 'Recursion',
    description: 'Recursive algorithms and patterns',
    problemCount: 8,
    completionPercentage: 45,
  },
  {
    id: '5',
    classId: '1',
    name: 'Sorting',
    description: 'Sorting algorithms and complexity',
    problemCount: 10,
    completionPercentage: 50,
  },
]

const mockStudents = [
  { id: '1', name: 'Alex Chen', email: 'alex@example.com', username: 'alchen', submissions: 45, progress: 85 },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', username: 'mgarcia', submissions: 42, progress: 78 },
  { id: '3', name: 'John Smith', email: 'john@example.com', username: 'jsmith', submissions: 38, progress: 70 },
  { id: '4', name: 'Emily Johnson', email: 'emily@example.com', username: 'ejohnson', submissions: 41, progress: 82 },
]

const mockReviewRequests = [
  {
    id: '1',
    student: 'Alex Chen',
    module: 'Loops',
    problem: 'Fibonacci',
    verdict: 'Correct',
    time: '2 hours ago',
  },
  {
    id: '2',
    student: 'Maria Garcia',
    module: 'Arrays',
    problem: 'Array Reversal',
    verdict: 'Wrong Answer',
    time: '4 hours ago',
  },
  {
    id: '3',
    student: 'John Smith',
    module: 'Functions',
    problem: 'Function Composition',
    verdict: 'Correct',
    time: '1 day ago',
  },
]

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={mockClass.totalStudents} icon={Users} />
        <StatCard title="Total Modules" value={mockClass.totalModules} icon={BookOpen} />
        <StatCard title="Total Problems" value={mockClass.totalProblems} icon={Code2} />
        <StatCard title="Total Submissions" value={mockClass.totalSubmissions} icon={FileText} />
        <StatCard title="Pending Reviews" value={mockClass.pendingReviews} icon={AlertCircle} color="rose" />
      </div>

      {/* Module Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Module Progress</h3>
        <div className="space-y-4">
          {mockModules.map((module) => (
            <div key={module.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-foreground">{module.name}</p>
                <p className="text-sm text-muted-foreground">{module.problemCount} problems</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${module.completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground min-w-12">{module.completionPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            'Student submitted Fibonacci problem',
            'Student requested teacher review',
            'Student completed Arrays module',
            'New assignment created',
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm text-foreground">{activity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModulesTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Modules</h3>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          Add Module
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockModules.map((module) => (
          <ModuleCard key={module.id} {...module} />
        ))}
      </div>
    </div>
  )
}

function StudentsTab() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-semibold text-foreground">Student Name</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Username</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Submissions</th>
            <th className="text-left py-3 px-4 font-semibold text-foreground">Progress</th>
          </tr>
        </thead>
        <tbody>
          {mockStudents.map((student) => (
            <tr key={student.id} className="border-b border-border hover:bg-secondary transition-colors">
              <td className="py-3 px-4 text-foreground">{student.name}</td>
              <td className="py-3 px-4 text-muted-foreground text-sm">{student.email}</td>
              <td className="py-3 px-4 text-foreground">{student.username}</td>
              <td className="py-3 px-4 text-foreground">{student.submissions}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{student.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReviewRequestsTab() {
  return (
    <div className="space-y-3">
      {mockReviewRequests.length > 0 ? (
        mockReviewRequests.map((request) => (
          <div key={request.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-foreground">{request.student}</p>
              <p className="text-sm text-muted-foreground">{request.module} • {request.problem}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={request.verdict === 'Correct' ? 'success' : 'warning'}>{request.verdict}</Badge>
              <span className="text-xs text-muted-foreground">{request.time}</span>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
                Review
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No review requests</p>
        </div>
      )}
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Class Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Class Name</label>
          <input
            type="text"
            defaultValue={mockClass.name}
            className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Class Code</label>
          <input
            type="text"
            defaultValue={mockClass.code}
            disabled
            className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-muted opacity-50"
          />
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default function ClassDetailsPage() {
  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'modules', label: 'Modules', content: <ModulesTab /> },
    { id: 'students', label: 'Students', content: <StudentsTab /> },
    { id: 'reviews', label: 'Review Requests', content: <ReviewRequestsTab /> },
    { id: 'settings', label: 'Settings', content: <SettingsTab /> },
  ]

  return (
    <DashboardLayout
      title={mockClass.name}
      subtitle={`Code: ${mockClass.code} • Teacher: ${mockClass.teacher}`}
    >
      <Tabs tabs={tabs} />
    </DashboardLayout>
  )
}
