'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/badge'
import { Tabs } from '@/components/tabs'
import { ModuleCard } from '@/components/module-card'
import { RequestState } from '@/components/request-state'
import { Users, BookOpen, Code2, FileText, AlertCircle } from 'lucide-react'
import { getClass, listModules, listStudents, listReviews, getDashboardStats, updateClass } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'
import { errorMessage } from '@/lib/api-client'

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const request = useRequest(async () => {
    const [classRow, modules, students, reviews, stats] = await Promise.all([
      getClass(id), listModules(id), listStudents(id), listReviews({ classId: id }), getDashboardStats(id),
    ])
    return { classRow, modules, students, reviews, stats }
  }, [id])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  if (!request.data) return <DashboardLayout title="Class"><RequestState loading={request.loading} error={request.error} onRetry={request.retry} /></DashboardLayout>
  const { classRow, modules, students, reviews, stats } = request.data
  const pending = reviews.filter(row => row.reviewStatus !== 'REVIEWED')

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const updated = await updateClass(id, { name: String(form.get('name')).trim(), isActive: form.get('isActive') === 'on' })
      request.setData(current => current ? { ...current, classRow: updated } : current)
      setSaved(true)
    } catch (error) { setSaveError(errorMessage(error)) }
    finally { setSaving(false) }
  }
  const tabs = [
    { id: 'overview', label: 'Overview', content: <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard title="Assigned Modules" value={stats.activeModules} icon={BookOpen} />
        <StatCard title="Total Problems" value={modules.reduce((sum, row) => sum + row.problemCount, 0)} icon={Code2} />
        <StatCard title="Total Submissions" value={stats.totalSubmissions} icon={FileText} />
        <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={AlertCircle} color="rose" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{modules.map(row => <ModuleCard key={row.id} {...row} />)}</div>
    </div> },
    { id: 'modules', label: 'Modules', content: <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Contact your administrator to assign or create modules.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{modules.map(row => <ModuleCard key={row.id} {...row} />)}</div>
      {!modules.length && <p className="text-muted-foreground">No modules assigned yet.</p>}
    </div> },
    { id: 'students', label: 'Students', content: <div className="overflow-x-auto">
      <table className="w-full text-left"><thead><tr className="border-b border-border">{['Student', 'Email', 'Username', 'Submissions'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead>
        <tbody>{students.map(row => <tr key={row.id} className="border-b border-border">
          <td className="p-3"><Link className="text-primary" href={`/students/${row.id}`}>{row.name}</Link></td><td className="p-3">{row.email}</td><td className="p-3">{row.username}</td><td className="p-3">{row.totalSubmissions}</td>
        </tr>)}{!students.length && <tr><td colSpan={4} className="p-6 text-muted-foreground">No students have joined yet.</td></tr>}</tbody>
      </table>
    </div> },
    { id: 'reviews', label: 'Review Requests', content: <div className="space-y-3">
      {pending.map(row => <div key={row.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
        <div><p className="font-medium">{row.submission?.studentName}</p><p className="text-sm text-muted-foreground">{row.submission?.moduleName} · {row.submission?.problemName}</p></div>
        <Badge variant={row.reviewStatus === 'IN_REVIEW' ? 'processing' : 'warning'}>{row.reviewStatus}</Badge>
        <Link href={`/submissions/${row.submissionId}`} className="text-primary">Open</Link>
      </div>)}{!pending.length && <p className="text-muted-foreground">No pending reviews.</p>}
    </div> },
    { id: 'settings', label: 'Settings', content: <form onSubmit={saveSettings} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <RequestState error={saveError} />{saved && <p role="status" className="text-green-600">Class updated.</p>}
      <label className="block">Class name<input name="name" required minLength={2} maxLength={100} defaultValue={classRow.name} className="block w-full mt-2 p-2 border border-border rounded-lg bg-card" /></label>
      <label className="block">Class code<input readOnly value={classRow.code} className="block w-full mt-2 p-2 border border-border rounded-lg bg-muted" /></label>
      <label className="flex gap-2"><input name="isActive" type="checkbox" defaultChecked={classRow.isActive} />Class is active</label>
      <button disabled={saving} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
    </form> },
  ]
  return <DashboardLayout title={classRow.name} subtitle={`Code: ${classRow.code} · ${classRow.isActive ? 'Active' : 'Inactive'}`}><div className="mb-4"><Link href="/classes" className="text-primary">Back to Classes</Link></div><Tabs tabs={tabs} /></DashboardLayout>
}
