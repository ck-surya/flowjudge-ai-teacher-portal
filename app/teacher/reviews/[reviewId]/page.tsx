'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RequestState } from '@/components/request-state'
import { listReviews } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

export default function TeacherReviewRedirect({ params }: { params: Promise<{ reviewId: string }> }) {
  const { reviewId } = use(params)
  const router = useRouter()
  const { data, loading, error, retry } = useRequest(() => listReviews(), [reviewId])
  const review = data?.find(row => row.id === reviewId)
  useEffect(() => { if (review) router.replace(`/submissions/${review.submissionId}`) }, [review, router])
  return <DashboardLayout title="Review"><RequestState loading={loading || !!review} error={error} onRetry={retry} />{data && !review && <p>Review not found.</p>}</DashboardLayout>
}
