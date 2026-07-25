'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'

const mockReviewRequests = [
  {
    id: '1',
    student: 'Alex Chen',
    class: 'Programming Fundamentals',
    module: 'Loops',
    problem: 'Fibonacci',
    verdict: 'Correct',
    requestedTime: '2 hours ago',
  },
  {
    id: '2',
    student: 'Maria Garcia',
    class: 'Advanced Algorithms',
    module: 'Arrays',
    problem: 'Array Reversal',
    verdict: 'Wrong Answer',
    requestedTime: '4 hours ago',
  },
  {
    id: '3',
    student: 'John Smith',
    class: 'Data Structures',
    module: 'Sorting',
    problem: 'Quick Sort',
    verdict: 'Correct',
    requestedTime: '1 day ago',
  },
  {
    id: '4',
    student: 'Emily Johnson',
    class: 'Programming Fundamentals',
    module: 'Functions',
    problem: 'Function Composition',
    verdict: 'Correct',
    requestedTime: '1 day ago',
  },
  {
    id: '5',
    student: 'David Lee',
    class: 'Web Development Basics',
    module: 'Recursion',
    problem: 'Tree Traversal',
    verdict: 'Compilation Error',
    requestedTime: '2 days ago',
  },
]

const verdictColors = {
  Correct: 'success',
  'Wrong Answer': 'error',
  'Compilation Error': 'warning',
} as const

export default function ReviewRequestsPage() {
  return (
    <DashboardLayout
      title="Review Requests"
      subtitle="Pending review requests from students"
    >
      <div className="space-y-3">
        {mockReviewRequests.length > 0 ? (
          mockReviewRequests.map((request) => (
            <div
              key={request.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">{request.student}</p>
                  <Badge variant={verdictColors[request.verdict as keyof typeof verdictColors]}>
                    {request.verdict}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {request.class} • {request.module} • {request.problem}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Requested {request.requestedTime}</p>
              </div>
              <Link href={`/submissions/${request.id}`}>
                <button className="ml-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                  Review
                </button>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No review requests at this time</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
