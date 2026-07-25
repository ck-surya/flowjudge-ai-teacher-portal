'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { User, Code2, Target } from 'lucide-react'

const mockStudent = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  username: 'alchen',
  class: 'Programming Fundamentals',
  totalSubmissions: 45,
  solvedProblems: 38,
  accuracy: 84,
}

const mockSubmissions = [
  {
    id: '1',
    class: 'Programming Fundamentals',
    module: 'Loops',
    problem: 'Fibonacci',
    verdict: 'Correct',
    reviewStatus: 'Not Requested',
    date: '2 hours ago',
  },
  {
    id: '2',
    class: 'Programming Fundamentals',
    module: 'Arrays',
    problem: 'Array Reversal',
    verdict: 'Correct',
    reviewStatus: 'Not Requested',
    date: '1 day ago',
  },
  {
    id: '3',
    class: 'Programming Fundamentals',
    module: 'Functions',
    problem: 'Function Composition',
    verdict: 'Correct',
    reviewStatus: 'In Review',
    date: '2 days ago',
  },
  {
    id: '4',
    class: 'Programming Fundamentals',
    module: 'Loops',
    problem: 'Pattern Printing',
    verdict: 'Wrong Answer',
    reviewStatus: 'Requested',
    date: '3 days ago',
  },
  {
    id: '5',
    class: 'Programming Fundamentals',
    module: 'Recursion',
    problem: 'Tree Traversal',
    verdict: 'Correct',
    reviewStatus: 'Reviewed',
    date: '4 days ago',
  },
]

const verdictColors = {
  Correct: 'success',
  'Wrong Answer': 'error',
} as const

const reviewStatusColors = {
  'Not Requested': 'default',
  Requested: 'warning',
  'In Review': 'processing',
  Reviewed: 'success',
} as const

export default function StudentProfilePage() {
  return (
    <DashboardLayout
      title={mockStudent.name}
      subtitle={`${mockStudent.class} • ${mockStudent.email}`}
    >
      <div className="space-y-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Submissions"
            value={mockStudent.totalSubmissions}
            icon={Code2}
          />
          <StatCard
            title="Solved Problems"
            value={mockStudent.solvedProblems}
            icon={Target}
          />
          <StatCard
            title="Accuracy"
            value={`${mockStudent.accuracy}%`}
            icon={User}
            color="green"
          />
        </div>

        {/* Student Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="font-medium text-foreground">{mockStudent.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">{mockStudent.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Username</p>
              <p className="font-medium text-foreground">{mockStudent.username}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Class</p>
              <p className="font-medium text-foreground">{mockStudent.class}</p>
            </div>
          </div>
        </div>

        {/* Submission History */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Submission History</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Module</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Problem</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Verdict</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Review Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors last:border-0">
                      <td className="py-3 px-4 text-foreground">{submission.class}</td>
                      <td className="py-3 px-4 text-foreground">{submission.module}</td>
                      <td className="py-3 px-4 text-foreground">{submission.problem}</td>
                      <td className="py-3 px-4">
                        <Badge variant={verdictColors[submission.verdict as keyof typeof verdictColors]}>
                          {submission.verdict}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={reviewStatusColors[submission.reviewStatus as keyof typeof reviewStatusColors]}>
                          {submission.reviewStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{submission.date}</td>
                      <td className="py-3 px-4">
                        <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
