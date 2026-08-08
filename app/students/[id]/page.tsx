'use client'

import { use, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { User, Code2, Target } from 'lucide-react'
import { getStudent, listSubmissions, getClass, type Submission, type Student } from '@/lib/teacherService'

type StudentPageProps = {
  params: Promise<{ id: string }>
}

export default function StudentProfilePage({ params }: StudentPageProps) {
  const { id } = use(params)
  const [student, setStudent] = useState<Student | null>(null)
  const [className, setClassName] = useState('')
  const [rows, setRows] = useState<Submission[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [row, rowSubmissions] = await Promise.all([getStudent(id), listSubmissions()])
      if (!mounted || !row) return
      const classData = await getClass(row.classId)
      if (!mounted) return
      setStudent(row)
      setClassName(classData?.name ?? 'Class')
      setRows(rowSubmissions.filter((s) => s.studentId === id))
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (!student) {
    return (
      <DashboardLayout title="Student" subtitle="Profile loading">
        <p className="text-muted-foreground">Student not found.</p>
      </DashboardLayout>
    )
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Submissions" value={student.totalSubmissions} icon={Code2} />
          <StatCard title="Solved Problems" value={student.solvedProblems} icon={Target} />
          <StatCard title="Accuracy" value={`${student.accuracy}%`} icon={User} color="green" />
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
              <p className="font-medium text-foreground">{className}</p>
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
                  {mappedRows.map((submission) => (
                    <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors last:border-0">
                      <td className="py-3 px-4 text-foreground">{submission.className}</td>
                      <td className="py-3 px-4 text-foreground">{submission.moduleName}</td>
                      <td className="py-3 px-4 text-foreground">{submission.problemName}</td>
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
                      <td className="py-3 px-4 text-muted-foreground text-sm">{submission.submissionTime}</td>
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
