'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { Search } from 'lucide-react'

const mockSubmissions = [
  {
    id: '1',
    student: 'Alex Chen',
    class: 'Programming Fundamentals',
    module: 'Loops',
    problem: 'Fibonacci',
    verdict: 'Correct',
    reviewStatus: 'Not Requested',
    date: '2 hours ago',
  },
  {
    id: '2',
    student: 'Maria Garcia',
    class: 'Advanced Algorithms',
    module: 'Arrays',
    problem: 'Array Reversal',
    verdict: 'Wrong Answer',
    reviewStatus: 'Requested',
    date: '4 hours ago',
  },
  {
    id: '3',
    student: 'John Smith',
    class: 'Data Structures',
    module: 'Sorting',
    problem: 'Quick Sort',
    verdict: 'Correct',
    reviewStatus: 'Reviewed',
    date: '1 day ago',
  },
  {
    id: '4',
    student: 'Emily Johnson',
    class: 'Programming Fundamentals',
    module: 'Functions',
    problem: 'Function Composition',
    verdict: 'Correct',
    reviewStatus: 'In Review',
    date: '1 day ago',
  },
  {
    id: '5',
    student: 'David Lee',
    class: 'Web Development Basics',
    module: 'Recursion',
    problem: 'Tree Traversal',
    verdict: 'Compilation Error',
    reviewStatus: 'Not Requested',
    date: '2 days ago',
  },
]

const verdictColors = {
  Correct: 'success',
  'Wrong Answer': 'error',
  'Compilation Error': 'warning',
  Judging: 'processing',
} as const

const reviewStatusColors = {
  'Not Requested': 'default',
  Requested: 'warning',
  'In Review': 'processing',
  Reviewed: 'success',
} as const

export default function SubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [verdictFilter, setVerdictFilter] = useState('all')

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    const matchesSearch =
      submission.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.problem.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = classFilter === 'all' || submission.class === classFilter
    const matchesVerdict = verdictFilter === 'all' || submission.verdict === verdictFilter
    return matchesSearch && matchesClass && matchesVerdict
  })

  return (
    <DashboardLayout
      title="Submissions"
      subtitle="Search and filter all submissions"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
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

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Classes</option>
              <option value="Programming Fundamentals">Programming Fundamentals</option>
              <option value="Advanced Algorithms">Advanced Algorithms</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Web Development Basics">Web Development Basics</option>
            </select>

            {/* Verdict Filter */}
            <select
              value={verdictFilter}
              onChange={(e) => setVerdictFilter(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Verdicts</option>
              <option value="Correct">Correct</option>
              <option value="Wrong Answer">Wrong Answer</option>
              <option value="Compilation Error">Compilation Error</option>
            </select>
          </div>
        </div>

        {/* Submissions Table */}
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
                  filteredSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-b border-border hover:bg-secondary transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">{submission.student}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{submission.class}</td>
                      <td className="py-3 px-4 text-foreground">{submission.module}</td>
                      <td className="py-3 px-4 text-foreground">{submission.problem}</td>
                      <td className="py-3 px-4">
                        <Badge variant={verdictColors[submission.verdict as keyof typeof verdictColors]}>
                          {submission.verdict}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={reviewStatusColors[submission.reviewStatus as keyof typeof reviewStatusColors]}>
                          {submission.reviewStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{submission.date}</td>
                      <td className="py-3 px-4">
                        <Link href={`/submissions/${submission.id}`}>
                          <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                            Open
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No submissions found
                    </td>
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
