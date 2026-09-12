'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { ChevronLeft } from 'lucide-react'
import { RequestState } from '@/components/request-state'
import { SubmissionFile } from '@/components/submission-file'
import { useRequest } from '@/lib/use-request'
import { errorMessage } from '@/lib/api-client'
import { getSubmission, startReview, saveReview } from '@/lib/teacherService'

type SubmissionPageProps = {
  params: Promise<{ id: string }>
}

export default function SubmissionDetailPage({ params }: SubmissionPageProps) {
  const { id } = use(params)
  const { data: submission, setData: setSubmission, loading, error, retry } = useRequest(() => getSubmission(id), [id])
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [verdict, setVerdict] = useState<'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES'>('CORRECT')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (submission?.review?.teacherVerdict) setVerdict(submission.review.teacherVerdict)
    setFeedback(submission?.review?.feedback ?? '')
    setActionError('')
    setSuccess('')
  }, [id, submission?.review?.id, submission?.review?.teacherVerdict, submission?.review?.feedback])

  const handleReview = async (publish: boolean) => {
    if (!submission) return
    setIsSaving(true)
    setActionError('')
    setSuccess('')
    try {
      const review = publish ? await saveReview(id, verdict, feedback) : await startReview(id)
      setSubmission({ ...submission, review, reviewStatus: review.reviewStatus })
      retry()
      setSuccess(publish ? 'Review published.' : 'Review claimed. You can now publish your feedback.')
    } catch (reason) { setActionError(errorMessage(reason)) }
    finally { setIsSaving(false) }
  }

  if (!submission) return <DashboardLayout title="Submission Review"><RequestState loading={loading} error={error} onRetry={retry} /></DashboardLayout>
  const readOnly = submission.reviewStatus === 'NOT_REQUESTED' || submission.reviewStatus === 'REVIEWED'

  const autoStatusMap = {
    COMPLETED: 'success',
    JUDGING: 'processing',
    FAILED: 'error',
    UPLOADED: 'default',
    CONVERTING: 'processing',
    SUBMITTING: 'processing',
  } as const

  return (
    <DashboardLayout title="Submission Review" subtitle="Review student flowchart and provide feedback">
      <div className="space-y-6">
        <RequestState error={error} onRetry={retry} />
        <div className="flex flex-wrap gap-4 justify-between"><Link href="/submissions" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back to Submissions</span>
        </Link><button onClick={retry} disabled={isSaving || loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh evaluation</button></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <Link href={`/students/${submission.studentId}`} className="font-medium text-primary">{submission.studentName}</Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <Link href={`/classes/${submission.classId}`} className="font-medium text-primary">{submission.className}</Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Module</p>
                  <Link href={`/classes/${submission.classId}/modules/${submission.moduleId}`} className="font-medium text-primary">{submission.moduleName}</Link>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problem</p>
                  <Link href={`/problems/${submission.problemId}?classId=${submission.classId}`} className="font-medium text-primary">{submission.problemName}</Link>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Flowchart Submission</h3>
              <SubmissionFile id={submission.id} filename={submission.originalFileName} />
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Automatic Evaluation</h3>
              <div className="space-y-3">
                {submission.errorMessage && <p role="alert" className="text-destructive">{submission.errorMessage}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={autoStatusMap[submission.automaticStatus as keyof typeof autoStatusMap] ?? 'default'}>{submission.automaticStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verdict</span>
                  <Badge variant={submission.verdict === 'Correct' ? 'success' : 'warning'}>{submission.verdict}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DOMjudge ID</span>
                  <span className="text-foreground font-mono text-sm">{submission.domjudgeId}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Generated Code</h3>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-foreground font-medium">{submission.language}</span>
              </div>
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono border border-border">{submission.generatedCode || 'Generated code is not available yet.'}</pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Teacher Review</h3>
              <div className="space-y-4">
                <RequestState error={actionError} />
                {success && <p role="status" className="text-green-600">{success}</p>}
                {submission.review?.teacherName && <p className="text-sm text-muted-foreground">Reviewer: {submission.review.teacherName}</p>}
                <Badge variant="default">{submission.reviewStatus.replaceAll('_', ' ')}</Badge>
                {submission.reviewStatus === 'NOT_REQUESTED' && <p className="text-sm text-muted-foreground">The student has not requested a review.</p>}
                {submission.reviewStatus === 'REVIEWED' && <p className="text-sm text-muted-foreground">This review has been completed.</p>}
                <div>
                  <label htmlFor="review-verdict" className="block text-sm font-medium text-foreground mb-2">Verdict</label>
                  <select id="review-verdict"
                    disabled={readOnly || isSaving}
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as 'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES')}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="CORRECT">Correct</option>
                    <option value="NEEDS_CHANGES">Needs Changes</option>
                    <option value="INCORRECT">Incorrect</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="review-feedback" className="block text-sm font-medium text-foreground mb-2">Feedback</label>
                  <textarea id="review-feedback"
                    disabled={readOnly || isSaving}
                    maxLength={5000}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {!readOnly && <div className="space-y-2">
                  {submission.reviewStatus === 'REQUESTED' && <button
                    onClick={() => handleReview(false)} disabled={isSaving}
                    className="w-full px-4 py-2 bg-muted rounded-lg disabled:opacity-50"
                  >{isSaving ? 'Starting…' : 'Start Review'}</button>}
                  <button onClick={() => handleReview(true)} disabled={isSaving || !feedback.trim()}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                  >{isSaving ? 'Saving…' : 'Publish Review'}</button>
                </div>}
              </div>
            </div>
            {submission.review && <section className="bg-card border border-border rounded-lg p-6 space-y-4" aria-label="Review history">
              <h3 className="font-semibold">Review History</h3>
              <p className="text-sm text-muted-foreground">Requested {new Date(submission.review.requestedAt).toLocaleString()}</p>
              {submission.review.startedAt && <p className="text-sm text-muted-foreground">Started {new Date(submission.review.startedAt).toLocaleString()}</p>}
              {submission.review.reviewedAt && <p className="text-sm text-muted-foreground">Completed {new Date(submission.review.reviewedAt).toLocaleString()}</p>}
              <ol className="space-y-4">{submission.review.events.map(event => <li key={event.id} className="border-l-2 border-primary pl-3 space-y-1">
                <p className="text-sm font-medium">{event.status.replaceAll('_', ' ')}{event.teacher ? ` · ${event.teacher.name}` : ''}</p>
                <p className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</p>
                {event.teacherVerdict && <p className="text-sm">{event.teacherVerdict.replaceAll('_', ' ')}</p>}
                {event.feedback && <p className="text-sm whitespace-pre-wrap break-words">{event.feedback}</p>}
              </li>)}</ol>
            </section>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
