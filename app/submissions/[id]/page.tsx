'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { ChevronLeft } from 'lucide-react'
import { getSubmission, getReviewBySubmissionId, saveReview, rejudgeSubmission, type Submission } from '@/lib/teacherService'

type SubmissionPageProps = {
  params: Promise<{ id: string }>
}

export default function SubmissionDetailPage({ params }: SubmissionPageProps) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [verdict, setVerdict] = useState<'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES'>('CORRECT')
  const [feedback, setFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const row = await getSubmission(id)
      const review = await getReviewBySubmissionId(id)
      if (!mounted) return
      if (row) {
        setSubmission(row)
        if (review?.teacherVerdict && ['CORRECT', 'INCORRECT', 'NEEDS_CHANGES'].includes(review.teacherVerdict)) {
          setVerdict(review.teacherVerdict as 'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES')
        }
        if (review?.feedback) setFeedback(review.feedback)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  const handleSave = async (publish = false) => {
    if (!submission) return
    setIsSaving(true)
    await saveReview(submission.id, verdict, feedback, publish ? 'REVIEWED' : 'IN_REVIEW')
    const next = await getSubmission(id)
    setSubmission(next ?? null)
    setIsSaving(false)
  }

  if (!submission) {
    return (
      <DashboardLayout title="Submission Review" subtitle="loading...">
        <p className="text-muted-foreground">Loading submission</p>
      </DashboardLayout>
    )
  }

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
        <Link href="/teacher/reviews">
          <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back to Review Queue</span>
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">{submission.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <p className="font-medium text-foreground">{submission.className}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Module</p>
                  <p className="font-medium text-foreground">{submission.moduleName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Problem</p>
                  <p className="font-medium text-foreground">{submission.problemName}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Flowchart Submission</h3>
              <div className="bg-secondary rounded-lg p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <img src={submission.flowchartUrl} alt="Flowchart" className="max-w-md w-full h-48 object-contain" />
                </div>
              </div>
              <button className="mt-3 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary">
                Rejudge Submission
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Automatic Evaluation</h3>
              <div className="space-y-3">
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
              <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs text-foreground font-mono border border-border">{submission.generatedCode}</pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Teacher Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Verdict</label>
                  <select
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
                  <label className="block text-sm font-medium text-foreground mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Write feedback for the student..."
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
                <button
                  onClick={async () => {
                    const next = await rejudgeSubmission(submission.id)
                    setSubmission(next ?? submission)
                  }}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Rejudge Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
