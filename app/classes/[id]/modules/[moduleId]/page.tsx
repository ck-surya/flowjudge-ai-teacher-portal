'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/badge'
import { ChevronLeft, Trash2, Plus } from 'lucide-react'
import { getModule, listProblems, createProblem, type ProblemItem } from '@/lib/teacherService'

type ModuleDetailsProps = {
  params: Promise<{ id: string; moduleId: string }>
}

export default function ModuleDetailsPage({ params }: ModuleDetailsProps) {
  const { id: classId, moduleId } = use(params)
  const [moduleRow, setModuleRow] = useState<any>(null)
  const [problems, setProblems] = useState<ProblemItem[]>([])
  
  const [showProblemModal, setShowProblemModal] = useState(false)
  const [problemForm, setProblemForm] = useState({ name: '', difficulty: 'Easy' as 'Easy'|'Medium'|'Hard' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [mod, rows] = await Promise.all([getModule(moduleId), listProblems(moduleId)])
      if (!mounted) return
      setModuleRow(
        mod
          ? {
              id: mod.id,
              classId: mod.classId,
              name: mod.name,
              description: mod.description,
            }
          : null,
      )
      setProblems(rows)
    }
    load()
    return () => {
      mounted = false
    }
  }, [moduleId])

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const created = await createProblem(moduleId, { name: problemForm.name, difficulty: problemForm.difficulty })
      setProblems([...problems, created])
      setShowProblemModal(false)
      setProblemForm({ name: '', difficulty: 'Easy' })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!moduleRow) {
    return (
      <DashboardLayout title="Module not found" subtitle="Not Found">
        <p className="text-muted-foreground">No module found.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={moduleRow.name} subtitle={moduleRow.description}>
      <div className="space-y-6">
        <Link href={`/teacher/classes/${classId}`}>
          <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ChevronLeft size={20} />
            <span>Back to Class</span>
          </button>
        </Link>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">Assigned Problems</h3>
            <button onClick={() => setShowProblemModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus size={16} />
              Add Problem
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="p-4 font-medium text-sm text-muted-foreground">Problem Name</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Difficulty</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Submissions</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map(problem => (
                  <tr key={problem.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">
                      <Link href={`/problems/${problem.id}`} className="hover:text-primary transition-colors cursor-pointer block w-full h-full">
                        {problem.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <Badge variant={problem.difficulty === 'Easy' ? 'success' : problem.difficulty === 'Medium' ? 'warning' : 'destructive'}>
                        {problem.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{problem.attempts} attempts</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/problems/${problem.id}`}>
                          <button className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">View</button>
                        </Link>
                        <button className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
