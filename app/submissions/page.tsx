'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { Search } from 'lucide-react'
import { RequestState } from '@/components/request-state'
import { useRequest } from '@/lib/use-request'
import { ClassModuleFilters } from '@/components/class-module-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { listSubmissions, type SubmissionStatus } from '@/lib/teacherService'

function SubmissionsContent() {
  const query = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const classFilter = query.get('classId') ?? ''
  const moduleFilter = query.get('moduleId') ?? ''
  const problemFilter = query.get('problemId') ?? ''
  const studentFilter = query.get('studentId') ?? ''
  const statuses: SubmissionStatus[] = ['UPLOADED', 'CONVERTING', 'SUBMITTING', 'JUDGING', 'COMPLETED', 'FAILED']
  const statusFilter = statuses.find(status => status === query.get('status')) ?? ''
  const updateFilters = (updates: Record<string, string>) => {
    const next = new URLSearchParams(query.toString())
    for (const [key, value] of Object.entries(updates)) { if (value) next.set(key, value); else next.delete(key) }
    router.replace(`${pathname}?${next}`, { scroll: false })
  }
  const [searchTerm, setSearchTerm] = useState('')
  const [verdictFilter, setVerdictFilter] = useState('all')
  const { data, loading, error, retry } = useRequest(() => listSubmissions({ classId: classFilter || undefined, moduleId: moduleFilter || undefined, status: statusFilter || undefined, studentId: studentFilter || undefined }), [classFilter, moduleFilter, statusFilter, studentFilter])
  const rows = data ?? []

  const verdictColors = {
    Correct: 'success',
    'Wrong Answer': 'error',
    'Compilation Error': 'warning',
    Processing: 'processing',
    'Runtime Error': 'error',
  } as const

  const filteredSubmissions = rows.filter((submission) => {
    const matchesSearch =
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.problemName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProblem = !problemFilter || submission.problemId === problemFilter
    const matchesVerdict = verdictFilter === 'all' || submission.verdict === verdictFilter
    return matchesSearch && matchesProblem && matchesVerdict
  })

  return (
    <DashboardLayout title="Submissions" subtitle="Search and filter all submissions">
      <div className="space-y-6">
        <div className="flex justify-end"><button type="button" onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh submissions</button></div>
        <RequestState loading={loading} error={error} onRetry={retry} />
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                aria-label="Search submissions"
                type="text"
                placeholder="Search student or problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <ClassModuleFilters classId={classFilter} moduleId={moduleFilter}
              onClassChange={classId => updateFilters({ classId, moduleId: '', problemId: '', studentId: '' })}
              onModuleChange={moduleId => updateFilters({ moduleId, problemId: '' })} />
            <label className="text-sm space-y-1">Evaluation status<select aria-label="Filter by evaluation status" value={statusFilter} onChange={e => updateFilters({ status: e.target.value })} className="block w-full px-3 py-2 border border-border rounded-lg bg-card">
              <option value="">All statuses</option>{statuses.map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
            </select></label>
            <select
              aria-label="Filter by verdict"
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Verdicts</option>
              {Array.from(new Set(rows.map(row => row.verdict))).sort().map(verdict => <option key={verdict} value={verdict}>{verdict}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 text-sm"><p role="status">{filteredSubmissions.length} matching submissions{problemFilter ? ' for the selected problem' : ''}</p>
          <button onClick={() => { setSearchTerm(''); setVerdictFilter('all'); router.replace(pathname, { scroll: false }) }} className="text-primary">Clear filters</button></div>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Module</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Problem</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Verdict</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Review Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => {
                    const reviewStatusLabel =
                      submission.reviewStatus === 'REQUESTED'
                        ? 'Requested'
                        : submission.reviewStatus === 'IN_REVIEW'
                          ? 'In Review'
                          : submission.reviewStatus === 'REVIEWED'
                            ? 'Reviewed'
                            : 'Not Requested'

                    return (
                      <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium"><Link href={`/students/${submission.studentId}`} className="hover:text-primary">{submission.studentName}</Link></td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{submission.className}</td>
                        <td className="py-3 px-4 text-foreground">{submission.moduleName}</td>
                        <td className="py-3 px-4 text-foreground"><Link href={`/problems/${submission.problemId}?classId=${submission.classId}`} className="text-primary">{submission.problemName}</Link></td>
                        <td className="py-3 px-4">
                          <Badge variant={verdictColors[submission.verdict as keyof typeof verdictColors] ?? 'default'}>
                            {submission.verdict}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              reviewStatusLabel === 'In Review'
                                ? 'processing'
                                : reviewStatusLabel === 'Requested'
                                  ? 'warning'
                                  : reviewStatusLabel === 'Reviewed'
                                    ? 'success'
                                    : 'default'
                            }
                          >
                            {reviewStatusLabel}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(submission.submissionTime).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Link href={`/submissions/${submission.id}`} aria-label={`Open ${submission.problemName} by ${submission.studentName}`} className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90">Open</Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">{loading ? 'Loading submissions…' : error ? 'Submissions could not be loaded.' : 'No submissions found'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function SubmissionsPage() {
  return <Suspense fallback={<RequestState loading />}><SubmissionsContent /></Suspense>
}
