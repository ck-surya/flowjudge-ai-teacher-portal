'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { listSubmissions, type Submission, startReview, saveReview, getReviewBySubmissionId } from '@/lib/teacherService'

export default function ReviewRequestsPage() {
  const [requests, setRequests] = useState<Submission[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const rows = await listSubmissions()
      if (!mounted) return
      setRequests(rows.filter((r) => r.reviewStatus === 'REQUESTED'))
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const openReview = async (submissionId: string) => {
    await startReview(submissionId)
  }

  if (!requests.length) {
    return (
      <DashboardLayout title="Review Requests" subtitle="Pending review requests from students">
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">No review requests at this time</p>
        </div>
      </DashboardLayout>
    )
  }

  const verdictColors = {
    Correct: 'success',
    'Wrong Answer': 'error',
    'Compilation Error': 'warning',
  } as const

  return (
    <DashboardLayout title="Review Requests" subtitle="Pending review requests from students">
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground">{request.studentName}</p>
                <Badge variant={verdictColors[request.verdict as keyof typeof verdictColors] ?? 'default'}>{request.verdict}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{request.className} • {request.moduleName} • {request.problemName}</p>
              <p className="text-xs text-muted-foreground mt-1">Requested recently</p>
            </div>
            <button
              onClick={() => openReview(request.id)}
              className="ml-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Link href={`/teacher/submissions/${request.id}`}>Review</Link>
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
