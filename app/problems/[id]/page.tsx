'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Tabs } from '@/components/tabs'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { getProblem, getSubmissionSubmissionsForProblem, type ProblemItem, type Submission } from '@/lib/teacherService'

type ProblemDetailsProps = {
  params: Promise<{ id: string }>
}

export default function ProblemDetailsPage({ params }: ProblemDetailsProps) {
  const { id } = use(params)
  const [problem, setProblem] = useState<ProblemItem | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [problemData, subRows] = await Promise.all([getProblem(id), getSubmissionSubmissionsForProblem(id)])
      if (!mounted) return
      setProblem(problemData ?? null)
      setSubmissions(subRows)
    }
    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (!problem) {
    return (
      <DashboardLayout title="Problem" subtitle="not found">
        <p className="text-muted-foreground">Problem not found.</p>
      </DashboardLayout>
    )
  }

  const mockProblem = {
    statement: `Given input values, produce expected output for ${problem.name}.`,
    inputFormat: 'A single input value as required by the problem statement.',
    outputFormat: 'Output should match accepted solution format.',
    constraints: 'Constraints are enforced by the judge config for this problem.',
    sampleInput: '5',
    sampleOutput: '0 1 1 2 3',
    timeLimit: '1s',
    memoryLimit: '256MB',
  }

  function ProblemInfoTab() {
    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Problem Statement</h4>
          <div className="bg-secondary p-4 rounded-lg text-foreground whitespace-pre-wrap text-sm">{mockProblem.statement}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Input Format</h4>
            <div className="bg-secondary p-4 rounded-lg text-foreground text-sm">{mockProblem.inputFormat}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Output Format</h4>
            <div className="bg-secondary p-4 rounded-lg text-foreground text-sm">{mockProblem.outputFormat}</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Constraints</h4>
          <div className="bg-secondary p-4 rounded-lg text-foreground text-sm whitespace-pre-wrap">{mockProblem.constraints}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Sample Input</h4>
            <div className="bg-card border border-border p-4 rounded-lg text-foreground text-sm font-mono">{mockProblem.sampleInput}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Sample Output</h4>
            <div className="bg-card border border-border p-4 rounded-lg text-foreground text-sm font-mono">{mockProblem.sampleOutput}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Time Limit</p>
            <p className="text-lg font-semibold text-foreground">{mockProblem.timeLimit}</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Memory Limit</p>
            <p className="text-lg font-semibold text-foreground">{mockProblem.memoryLimit}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">DOMjudge Problem ID</p>
          <div className="flex items-center gap-2">
            <p className="text-foreground font-mono">{problem.domjudgeId}</p>
            <a href="#" className="text-primary hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /></a>
          </div>
        </div>
      </div>
    )
  }

  function SubmissionsTab() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Student Name</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Class</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Verdict</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="py-3 px-4 text-foreground font-medium">{submission.studentName}</td>
                <td className="py-3 px-4 text-muted-foreground">{submission.className}</td>
                <td className="py-3 px-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${submission.verdict === 'Correct' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                    {submission.verdict}
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{submission.submissionTime}</td>
                <td className="py-3 px-4">
                  <Link href={`/teacher/submissions/${submission.id}`}>
                    <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">View</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const tabs = [
    { id: 'info', label: 'Problem Information', content: <ProblemInfoTab /> },
    { id: 'submissions', label: 'Submissions', content: <SubmissionsTab /> },
  ]

  return (
    <DashboardLayout title={problem.name} subtitle={`ID: ${problem.domjudgeId}`}>
      <div className="space-y-6">
        <Link href="/teacher/classes/1">
          <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </Link>
        <Tabs tabs={tabs} />
      </div>
    </DashboardLayout>
  )
}
