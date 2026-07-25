'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { ChevronLeft, Trash2, Plus } from 'lucide-react'

const mockModule = {
  id: '1',
  classId: '1',
  name: 'Loops',
  description: 'Learn iterative programming concepts',
}

const mockProblems = [
  {
    id: '1',
    name: 'Simple Loop',
    domjudgeId: 'prob-001',
    difficulty: 'Easy',
    attempts: 0,
  },
  {
    id: '2',
    name: 'Nested Loops',
    domjudgeId: 'prob-002',
    difficulty: 'Medium',
    attempts: 3,
  },
  {
    id: '3',
    name: 'Fibonacci Loop',
    domjudgeId: 'prob-003',
    difficulty: 'Medium',
    attempts: 15,
  },
  {
    id: '4',
    name: 'Pattern Printing',
    domjudgeId: 'prob-004',
    difficulty: 'Medium',
    attempts: 8,
  },
  {
    id: '5',
    name: 'While Loop Patterns',
    domjudgeId: 'prob-005',
    difficulty: 'Hard',
    attempts: 5,
  },
  {
    id: '6',
    name: 'Do-While Loop',
    domjudgeId: 'prob-006',
    difficulty: 'Easy',
    attempts: 2,
  },
  {
    id: '7',
    name: 'Loop Optimization',
    domjudgeId: 'prob-007',
    difficulty: 'Hard',
    attempts: 4,
  },
  {
    id: '8',
    name: 'Complex Iteration',
    domjudgeId: 'prob-008',
    difficulty: 'Hard',
    attempts: 12,
  },
]

const difficultyColors = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
} as const

export default function ModuleDetailsPage() {
  return (
    <DashboardLayout title={mockModule.name} subtitle={mockModule.description}>
      <div className="space-y-6">
        {/* Back button */}
        <Link href={`/classes/${mockModule.classId}`}>
          <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back to Class</span>
          </button>
        </Link>

        {/* Assigned Problems */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Assigned Problems</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus size={16} />
              Add Problem
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Problem Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">DOMjudge ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Difficulty</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Attempts</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProblems.map((problem) => (
                  <tr key={problem.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-3 px-4">
                      <Link href={`/problems/${problem.id}`}>
                        <span className="text-foreground font-medium hover:text-primary cursor-pointer">
                          {problem.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{problem.domjudgeId}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          difficultyColors[problem.difficulty as keyof typeof difficultyColors]
                        }
                      >
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground">{problem.attempts}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/problems/${problem.id}`}>
                          <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                            View
                          </button>
                        </Link>
                        <button className="p-1 text-destructive hover:bg-rose-100 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No problems message */}
        {mockProblems.length === 0 && (
          <div className="text-center py-8 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No problems assigned</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
