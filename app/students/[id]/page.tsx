'use client'

import { use } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { User, Code2, Target } from 'lucide-react'
import { RequestState } from '@/components/request-state'
import { useRequest } from '@/lib/use-request'
import { getStudent } from '@/lib/teacherService'

type StudentPageProps = {
  params: Promise<{ id: string }>
}

export default function StudentProfilePage({ params }: StudentPageProps) {
  const { id } = use(params)
  const { data, loading, error, retry } = useRequest(() => getStudent(id), [id])
  if (!data) return <DashboardLayout title="Student"><RequestState loading={loading} error={error} onRetry={retry} /><Link href="/classes" className="text-primary">Back to Classes</Link></DashboardLayout>
  const { student, submissions: rows, summary } = data
  const className = data.classes.map(row => row.name).join(', ')

  const verdictColors = {
    Correct: 'success',
    'Wrong Answer': 'error',
  } as const

  const mappedRows = rows.map((submission) => {
    const statusLabel =
      submission.reviewStatus === 'REQUESTED'
        ? 'Requested'
        : submission.reviewStatus === 'IN_REVIEW'
          ? 'In Review'
          : submission.reviewStatus === 'REVIEWED'
            ? 'Reviewed'
            : 'Not Requested'

    return { ...submission, statusLabel }
  })

  return (
    <DashboardLayout title={student.name} subtitle={`${className} • ${student.email}`}>
      <div className="space-y-8">
        <div className="flex justify-between gap-4"><Link className="text-primary" href="/classes">Back to Classes</Link><button onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh student</button></div>
        <RequestState error={error} onRetry={retry} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Submissions" value={summary.submissionCount} icon={Code2} />
          <StatCard title="Correct Submissions" value={summary.correctCount} icon={Target} />
          <StatCard title="Automatic Accuracy" value={summary.completedCount ? `${summary.accuracy}%` : '—'} icon={User} color="green" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="font-medium text-foreground">{student.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">{student.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Username</p>
              <p className="font-medium text-foreground">{student.username}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Class</p>
              <div className="space-y-2">{data.classes.map(row => <Link key={row.id} href={`/classes/${row.id}#students`} className="block text-primary">{row.name}<span className="block text-xs text-muted-foreground">Joined {new Date(row.joinedAt).toLocaleDateString()}</span></Link>)}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Submission History</h3>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Module</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Problem</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Verdict</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Review Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No submissions yet.</td></tr>}
                  {mappedRows.map((submission) => (
                    <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors last:border-0">
                      <td className="py-3 px-4 text-foreground">{submission.className}</td>
                      <td className="py-3 px-4 text-foreground">{submission.moduleName}</td>
                      <td className="py-3 px-4 text-foreground"><Link href={`/submissions/${submission.id}`} className="text-primary">{submission.problemName}</Link></td>
                      <td className="py-3 px-4">
                        <Badge variant={verdictColors[submission.verdict as keyof typeof verdictColors] ?? 'default'}>{submission.verdict}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={submission.statusLabel === 'In Review' ? 'processing' : submission.statusLabel === 'Requested' ? 'warning' : submission.statusLabel === 'Reviewed' ? 'success' : 'default'}
                        >
                          {submission.statusLabel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{new Date(submission.submissionTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
