'use client'

import { use } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { RequestState } from '@/components/request-state'
import { listModuleProblems, listSubmissions } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

export default function ModuleDetailsPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = use(params)
  const { data, loading, error, retry } = useRequest(async () => {
    const [catalog, submissions] = await Promise.all([listModuleProblems(id, moduleId), listSubmissions({ classId: id, moduleId })])
    return { ...catalog, submissions }
  }, [id, moduleId])
  return <DashboardLayout title={data?.module?.name ?? 'Module'} subtitle={data?.module?.description}>
    <RequestState loading={loading} error={error} onRetry={retry} />
    {data && <div className="space-y-6">
      <div className="flex justify-between gap-4"><Link className="text-primary" href={`/classes/${id}#modules`}>Back to Class</Link><button onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh module</button></div>
      {data.module ? <>
        <div className="p-6 bg-card border border-border rounded-lg space-y-2">
          <p>{data.problems.length} assigned {data.problems.length === 1 ? 'problem' : 'problems'} · {data.module.isActive ? 'Active' : 'Inactive'}</p>
          <h3 className="font-semibold pt-4">Problems</h3>
          <div className="space-y-3">{data.problems.map(problem => <div key={problem.id} className="flex flex-wrap justify-between items-center gap-3 p-4 border border-border rounded-lg">
            <div className="flex-1 min-w-0"><Link href={`/problems/${problem.id}?classId=${id}`} className="font-medium text-primary">{problem.title}</Link>
              {problem.description && <p className="text-sm text-muted-foreground mt-1">{problem.description}</p>}
              <p className="text-xs text-muted-foreground mt-2">{problem.difficulty?.replaceAll('_', ' ') ?? 'Difficulty unspecified'} · {problem.submissionCount} submissions in this class</p>
            </div>
            <Badge variant={problem.isActive ? 'success' : 'default'}>{problem.isActive ? 'Active' : 'Inactive'}</Badge>
            <Link href={`/problems/${problem.id}?classId=${id}`} className="px-3 py-2 border border-border rounded-lg">View problem</Link>
          </div>)}</div>
          {!data.problems.length && <p className="text-muted-foreground">No problems in this module yet.</p>}
        </div>
        <div className="p-6 bg-card border border-border rounded-lg space-y-4"><h3 className="font-semibold">Module Submissions</h3>
          {data.submissions.map(row => <Link key={row.id} href={`/submissions/${row.id}`} className="block p-3 border-b border-border hover:bg-secondary">{row.studentName} · {row.problemName} · {row.verdict}</Link>)}
          {!data.submissions.length && <p className="text-muted-foreground">No submissions yet.</p>}
        </div>
      </> : <p>This module is not assigned to this class.</p>}
    </div>}
  </DashboardLayout>
}
