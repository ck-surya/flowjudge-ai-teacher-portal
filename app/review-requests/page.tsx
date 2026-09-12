'use client'

import Link from 'next/link'
import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { RequestState } from '@/components/request-state'
import { ClassModuleFilters } from '@/components/class-module-filters'
import { listReviews, type ReviewStatus } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

export default function ReviewRequestsPage() {
  const [classId, setClassId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [status, setStatus] = useState<ReviewStatus | 'ALL'>('ALL')
  const { data, loading, error, retry } = useRequest(() => listReviews({ status: status === 'ALL' ? undefined : status, classId: classId || undefined, moduleId: moduleId || undefined }), [status, classId, moduleId])
  return <DashboardLayout title="Review Requests" subtitle="Student requests and completed reviews">
    <div className="space-y-4">
      <div className="flex justify-end"><button type="button" onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh reviews</button></div>
      <div className="grid gap-4 sm:grid-cols-3 bg-card border border-border rounded-lg p-4">
      <ClassModuleFilters classId={classId} moduleId={moduleId} onClassChange={value => { setClassId(value); setModuleId('') }} onModuleChange={setModuleId} />
      <label className="block">Review status <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="ml-2 px-4 py-2 bg-card border border-border rounded-lg">
        <option value="ALL">All reviews</option><option value="REQUESTED">Requested</option><option value="IN_REVIEW">In review</option><option value="REVIEWED">Reviewed</option>
      </select></label></div>
      <RequestState loading={loading} error={error} onRetry={retry} />
      {data?.map(review => <div key={review.id} className="bg-card border border-border rounded-lg p-4 flex justify-between items-center gap-4">
        <div className="flex-1"><p className="font-semibold">{review.submission?.studentName}</p>
          <p className="text-sm text-muted-foreground">{review.submission?.className} · {review.submission?.moduleName} · {review.submission?.problemName}</p>
          {review.teacherName && <p className="text-sm text-muted-foreground">Reviewer: {review.teacherName}</p>}
          {review.teacherVerdict && <p className="text-sm">{review.teacherVerdict.replaceAll('_', ' ')}</p>}
          <p className="text-xs text-muted-foreground">Requested {new Date(review.requestedAt).toLocaleString()}</p>
        </div>
        <Badge variant={review.reviewStatus === 'REVIEWED' ? 'success' : review.reviewStatus === 'IN_REVIEW' ? 'processing' : 'warning'}>{review.reviewStatus.replaceAll('_', ' ')}</Badge>
        <Link href={`/submissions/${review.submissionId}`} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">{review.reviewStatus === 'REVIEWED' ? 'View' : 'Review'}</Link>
      </div>)}
      {data?.length === 0 && <p className="p-6 text-center text-muted-foreground">No matching review requests.</p>}
    </div>
  </DashboardLayout>
}
