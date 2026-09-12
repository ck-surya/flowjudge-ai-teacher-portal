'use client'

import Link from 'next/link'
import { listReviews } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'
import { RequestState } from './request-state'

export function ReviewNotifications({ onNavigate }: { onNavigate: () => void }) {
  const { data, loading, error, retry } = useRequest(async () => {
    const [requested, inReview] = await Promise.all([listReviews({ status: 'REQUESTED' }), listReviews({ status: 'IN_REVIEW' })])
    return [...requested, ...inReview].sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))
  })
  return <div className="px-4 py-3 text-sm space-y-3">
    <RequestState loading={loading} error={error} onRetry={retry} />
    {data && <p className="text-muted-foreground">{data.length ? `${data.length} pending reviews` : 'No pending reviews.'}</p>}
    {data?.slice(0, 5).map(review => <Link key={review.id} href={`/submissions/${review.submissionId}`} onClick={onNavigate} className="block border-b border-border pb-2 hover:text-primary">
      <span className="block font-medium">{review.submission?.studentName}</span>
      <span className="block text-xs text-muted-foreground">{review.submission?.problemName} · {review.reviewStatus.replaceAll('_', ' ')}</span>
    </Link>)}
    <Link href="/review-requests" onClick={onNavigate} className="block text-primary">View student review requests</Link>
  </div>
}
