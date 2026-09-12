'use client'

import { Suspense, use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { RequestState } from '@/components/request-state'
import { ProblemStatement } from '@/components/submission-file'
import { getProblem } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

function ProblemDetails({ id }: { id: string }) {
  const classId = useSearchParams().get('classId')
  const { data: problem, loading, error, retry } = useRequest(() => getProblem(id), [id])
  return <DashboardLayout title={problem?.title ?? 'Problem Details'} subtitle={problem?.module.name}>
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <Link href={classId && problem ? `/classes/${encodeURIComponent(classId)}/modules/${problem.module.id}` : '/classes'} className="text-primary">{classId && problem ? 'Back to Module' : 'Back to Classes'}</Link>
        <button onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh problem</button>
      </div>
      <RequestState loading={loading} error={error} onRetry={retry} />
      {problem && <>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant={problem.isActive ? 'success' : 'default'}>{problem.isActive ? 'Active' : 'Inactive'}</Badge>
            <span className="text-sm text-muted-foreground">{problem.difficulty?.replaceAll('_', ' ') ?? 'Difficulty unspecified'}</span>
          </div>
          <p className="whitespace-pre-wrap">{problem.description || 'Read the problem statement for the problem instructions.'}</p>
          <p className="text-sm text-muted-foreground">{problem.submissionCount} submissions across your classes</p>
          <Link href={`/submissions?${new URLSearchParams({ problemId: id, moduleId: problem.module.id, ...(classId ? { classId } : {}) })}`} className="inline-block px-4 py-2 border border-border rounded-lg">View problem submissions</Link>
        </div>
        <section className="bg-card border border-border rounded-lg p-6 space-y-4" aria-label="Problem statement">
          <h3 className="text-lg font-semibold">Problem Statement</h3>
          {problem.statementPdfUrl || problem.statementHtmlUrl ? <ProblemStatement key={id} id={id} /> : <p className="text-muted-foreground">No statement is available for this problem.</p>}
        </section>
      </>}
    </div>
  </DashboardLayout>
}

export default function ProblemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <Suspense fallback={<RequestState loading />}><ProblemDetails id={id} /></Suspense>
}
