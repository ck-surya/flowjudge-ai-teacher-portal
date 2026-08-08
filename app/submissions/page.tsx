'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { Search } from 'lucide-react'
import { listSubmissions } from '@/lib/teacherService'

type SubmissionRow = {
  id: string
  studentName: string
  className: string
  moduleName: string
  problemName: string
  verdict: 'Correct' | 'Wrong Answer' | 'Compilation Error' | 'Processing' | 'Runtime Error'
  reviewStatus: string
  submissionTime: string
}

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [verdictFilter, setVerdictFilter] = useState('all')
  const [rows, setRows] = useState<SubmissionRow[]>([])

  useEffect(() => {
    const load = async () => {
      const data = await listSubmissions()
      setRows(data as SubmissionRow[])
    }
    load()
  }, [])

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
    const matchesClass = classFilter === 'all' || submission.className === classFilter
    const matchesVerdict = verdictFilter === 'all' || submission.verdict === verdictFilter
    return matchesSearch && matchesClass && matchesVerdict
  })

  return (
    <DashboardLayout title="Submissions" subtitle="Search and filter all submissions">
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search student or problem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Classes</option>
              {Array.from(new Set(rows.map((row) => row.className))).map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Verdicts</option>
              <option value="Correct">Correct</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Compilation Error">Compilation Error</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>

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
                        <td className="py-3 px-4 text-foreground font-medium">{submission.studentName}</td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">{submission.className}</td>
                        <td className="py-3 px-4 text-foreground">{submission.moduleName}</td>
                        <td className="py-3 px-4 text-foreground">{submission.problemName}</td>
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
                        <td className="py-3 px-4 text-muted-foreground text-sm">{submission.submissionTime}</td>
                        <td className="py-3 px-4">
                          <Link href={`/teacher/submissions/${submission.id}`}>
                            <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">Open</button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">No submissions found</td>
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
