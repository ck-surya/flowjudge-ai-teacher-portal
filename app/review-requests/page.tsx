'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { replaceListFilters } from '@/lib/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { RequestState } from '@/components/request-state'
import { ClassModuleFilters } from '@/components/class-module-filters'
import { listReviews, type ReviewStatus } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

function ReviewRequestsContent() {
  const query = useSearchParams()
  const pathname = usePathname()
  const classId = query.get('classId') ?? ''
  const moduleId = query.get('moduleId') ?? ''
  const statuses: ReviewStatus[] = ['REQUESTED', 'IN_REVIEW', 'REVIEWED']
  const status = statuses.find(value => value === query.get('status')) ?? 'ALL'
  const updateFilters = replaceListFilters
  const { data, loading, error, retry } = useRequest(() => listReviews({ status: status === 'ALL' ? undefined : status, classId: classId || undefined, moduleId: moduleId || undefined }), [status, classId, moduleId])
  return <DashboardLayout title="Review Requests" subtitle="Student requests and completed reviews">
    <div className="space-y-4">
      <div className="flex justify-end"><button type="button" onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh reviews</button></div>
      <div className="grid gap-4 sm:grid-cols-3 bg-card border border-border rounded-lg p-4">
      <ClassModuleFilters classId={classId} moduleId={moduleId} onClassChange={value => updateFilters({ classId: value, moduleId: '' })} onModuleChange={value => updateFilters({ moduleId: value })} />
      <label className="text-sm space-y-1">Review status <select aria-label="Filter by review status" value={status} onChange={e => updateFilters({ status: e.target.value === 'ALL' ? '' : e.target.value })} className="block w-full px-3 py-2 bg-card border border-border rounded-lg">
        <option value="ALL">All reviews</option><option value="REQUESTED">Requested</option><option value="IN_REVIEW">In review</option><option value="REVIEWED">Reviewed</option>
      </select></label></div>
      <RequestState loading={loading} error={error} onRetry={retry} />
      <div className="flex justify-between gap-3 text-sm"><p role="status">{data?.length ?? 0} matching reviews</p><button onClick={() => window.history.replaceState(null, '', pathname)} className="text-primary">Clear filters</button></div>
      {data?.map(review => <div key={review.id} className="bg-card border border-border rounded-lg p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex-1 min-w-[160px] break-words"><p className="font-semibold">{review.submission?.studentName}</p>
          <p className="text-sm text-muted-foreground">{review.submission?.className} · {review.submission?.moduleName} · {review.submission?.problemName}</p>
          {review.teacherName && <p className="text-sm text-muted-foreground">Reviewer: {review.teacherName}</p>}
          {review.teacherVerdict && <p className="text-sm">{review.teacherVerdict.replaceAll('_', ' ')}</p>}
          <p className="text-xs text-muted-foreground">Requested {new Date(review.requestedAt).toLocaleString()}</p>
        </div>
        <Badge variant={review.reviewStatus === 'REVIEWED' ? 'success' : review.reviewStatus === 'IN_REVIEW' ? 'processing' : 'warning'}>{review.reviewStatus.replaceAll('_', ' ')}</Badge>
        <Link href={`/submissions/${review.submissionId}?returnTo=${encodeURIComponent(`${pathname}?${query}`)}`} aria-label={`${review.reviewStatus === 'REVIEWED' ? 'View review' : 'Review submission'} by ${review.submission?.studentName ?? 'student'}`} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">{review.reviewStatus === 'REVIEWED' ? 'View' : 'Review'}</Link>
      </div>)}
      {data?.length === 0 && <p className="p-6 text-center text-muted-foreground">No matching review requests.</p>}
    </div>
  </DashboardLayout>
}

export default function ReviewRequestsPage() {
  return <Suspense fallback={<RequestState loading />}><ReviewRequestsContent /></Suspense>
}
