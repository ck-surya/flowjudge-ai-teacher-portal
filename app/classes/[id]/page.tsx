'use client'

import { use, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { Tabs } from '@/components/tabs'
import { ModuleCard } from '@/components/module-card'
import { Users, BookOpen, Code2, FileText, AlertCircle, Plus } from 'lucide-react'
import { getClass, listModules, listStudents, listSubmissions, createModule, type ClassItem, type ModuleItem, type Student, type Submission } from '@/lib/teacherService'

type ClassDetailsProps = {
  params: Promise<{ id: string }>
}

export default function ClassDetailsPage({ params }: ClassDetailsProps) {
  const { id: classId } = use(params)

  const [classRow, setClassRow] = useState<ClassItem | null>(null)
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [reviewRequests, setReviewRequests] = useState<Submission[]>([])
  
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [moduleForm, setModuleForm] = useState({ name: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      const [classData, moduleData, studentData, submissions] = await Promise.all([
        getClass(classId),
        listModules(classId),
        listStudents(classId),
        listSubmissions({ classId }),
      ])
      if (!active) return
      setClassRow(classData ?? null)
      setModules(moduleData)
      setStudents(studentData)
      const requested = submissions.filter((s) => s.reviewStatus === 'REQUESTED')
      setReviewRequests(requested)
    }
    load()
    return () => {
      active = false
    }
  }, [classId])

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const created = await createModule(classId, { name: moduleForm.name, description: moduleForm.description })
      setModules([...modules, created])
      setShowModuleModal(false)
      setModuleForm({ name: '', description: '' })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!classRow) {
    return (
      <DashboardLayout title="Class not found" subtitle="Unable to load class">
        <p className="text-muted-foreground">Class does not exist.</p>
      </DashboardLayout>
    )
  }

  const mockClassStats = {
    totalStudents: classRow.students,
    totalModules: modules.length,
    totalProblems: modules.reduce((acc, module) => acc + module.problemCount, 0),
    totalSubmissions: reviewRequests.length + 387,
    pendingReviews: classRow.pendingReviews,
  }

  function OverviewTab() {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Students" value={mockClassStats.totalStudents} icon={Users} />
          <StatCard title="Total Modules" value={mockClassStats.totalModules} icon={BookOpen} />
          <StatCard title="Total Problems" value={mockClassStats.totalProblems} icon={Code2} />
          <StatCard title="Total Submissions" value={mockClassStats.totalSubmissions} icon={FileText} />
          <StatCard title="Pending Reviews" value={mockClassStats.pendingReviews} icon={AlertCircle} color="rose" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Module Progress</h3>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{module.name}</p>
                  <p className="text-sm text-muted-foreground">{module.problemCount} problems</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${module.completionPercentage}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground min-w-12">{module.completionPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function ModulesTab() {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Modules</h3>
          <button onClick={() => setShowModuleModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} />
            Add Module
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => <ModuleCard key={module.id} {...module} />)}
          {modules.length === 0 && (
            <p className="col-span-full text-muted-foreground py-8 text-center border-2 border-dashed border-border rounded-xl">
              No modules have been created yet.
            </p>
          )}
        </div>
        
        {/* Create Module Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Create New Module</h3>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Module Name</label>
                  <input required value={moduleForm.name} onChange={e => setModuleForm({...moduleForm, name: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Conditionals and Loops" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea rows={3} value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Short description of what this module covers..." />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowModuleModal(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">Create Module</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  function StudentsTab() {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Student Name</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Username</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Submissions</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Progress</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="py-3 px-4 text-foreground">{student.name}</td>
                <td className="py-3 px-4 text-muted-foreground text-sm">{student.email}</td>
                <td className="py-3 px-4 text-foreground">{student.username}</td>
                <td className="py-3 px-4 text-foreground">{student.totalSubmissions}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${student.accuracy}%` }} /></div>
                    <span className="text-sm font-medium text-foreground">{student.accuracy}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function ReviewRequestsTab() {
    return (
      <div className="space-y-3">
        {reviewRequests.length > 0 ? (
          reviewRequests.map((request) => (
            <div key={request.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{request.studentName}</p>
                <p className="text-sm text-muted-foreground">{request.moduleName} • {request.problemName}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={request.verdict === 'Correct' ? 'success' : 'warning'}>{request.verdict}</Badge>
                <a href={`/teacher/submissions/${request.id}`} className="text-sm text-primary">Open</a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No review requests</div>
        )}
      </div>
    )
  }

  function SettingsTab() {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Class Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Class Name</label>
            <input
              type="text"
              defaultValue={classRow.name}
              className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Class Code</label>
            <input type="text" defaultValue={classRow.code} disabled className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-muted opacity-50" />
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">Save Changes</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', content: <OverviewTab /> },
    { id: 'modules', label: 'Modules', content: <ModulesTab /> },
    { id: 'students', label: 'Students', content: <StudentsTab /> },
    { id: 'reviews', label: 'Review Requests', content: <ReviewRequestsTab /> },
    { id: 'settings', label: 'Settings', content: <SettingsTab /> },
  ]

  return (
    <DashboardLayout title={classRow.name} subtitle={`${classRow.code} • Teacher: ${classRow.teacherId}`}>
      <Tabs tabs={tabs} />
    </DashboardLayout>
  )
}
