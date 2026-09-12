'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ClassCard } from '@/components/class-card'
import { Modal } from '@/components/modal'
import { createClass, updateClass, listClasses, type ClassItem } from '@/lib/teacherService'
import { RequestState } from '@/components/request-state'
import { useRequest } from '@/lib/use-request'
import { errorMessage } from '@/lib/api-client'
import { Plus, Edit2 } from 'lucide-react'

export default function ClassesPage() {
  const { data, setData, loading, error, retry } = useRequest(listClasses)
  const classes = data ?? []
  const [modal, setModal] = useState<'create' | ClassItem | null>(null)
  const [form, setForm] = useState({ name: '', code: '', isActive: true })
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const open = (item: 'create' | ClassItem) => {
    setModal(item)
    setForm(item === 'create' ? { name: '', code: '', isActive: true } : { name: item.name, code: item.code, isActive: item.isActive })
    setFormError('')
    setNotice('')
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!modal || saving) return
    if (form.name.trim().length < 2) { setFormError('Class name must contain at least two characters.'); return }
    setSaving(true)
    setFormError('')
    try {
      const row = modal === 'create' ? await createClass({ name: form.name, code: form.code })
        : await updateClass(modal.id, { name: form.name.trim(), isActive: form.isActive })
      setData(current => modal === 'create' ? [...(current ?? []), row] : (current ?? []).map(item => item.id === row.id ? row : item))
      setNotice(modal === 'create' ? `${row.name} created. Share code ${row.code} with your students.` : `${row.name} updated.`)
      setModal(null)
    } catch (reason) { setFormError(errorMessage(reason)) }
    finally { setSaving(false) }
  }
  return <DashboardLayout title="Classes" subtitle="Manage your programming classes">
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <p className="text-sm text-muted-foreground">{loading ? 'Loading classes…' : `${classes.length} total classes`}</p>
        <div className="flex gap-2">
          <button onClick={retry} disabled={loading} className="px-3 py-2 border border-border rounded-lg disabled:opacity-50">Refresh classes</button>
          <button onClick={() => open('create')} disabled={loading || !!error} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"><Plus size={16} />Create Class</button>
        </div>
      </div>
      <RequestState loading={loading} error={error} onRetry={retry} />
      {notice && <p role="status" className="rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm">{notice}</p>}
      {!loading && !error && !classes.length && <div className="py-12 text-center border border-dashed border-border rounded-lg"><p>No classes yet. Create your first class to get started.</p></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(item => <div key={item.id} className="space-y-2">
          <ClassCard {...item} />
          <button aria-label={`Edit ${item.name}`} onClick={() => open(item)} className="flex items-center gap-2 px-3 py-2 text-sm text-primary border border-border rounded-lg hover:bg-secondary"><Edit2 size={16} />Edit Class</button>
        </div>)}
      </div>
      {modal && <Modal title={modal === 'create' ? 'Create New Class' : 'Edit Class'} busy={saving} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="space-y-4">
          <RequestState error={formError} />
          <fieldset disabled={saving} className="space-y-4">
            <label className="block text-sm font-medium">Class Name
              <input autoFocus required minLength={2} maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="block w-full px-3 py-2 mt-1 border border-border rounded-lg bg-background" placeholder="e.g. Intro to Python" />
            </label>
            <label className="block text-sm font-medium">Class Code
              <input required readOnly={modal !== 'create'} minLength={4} maxLength={30} pattern="[A-Z0-9-]{4,30}" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="block w-full px-3 py-2 mt-1 border border-border rounded-lg bg-background read-only:bg-muted" placeholder="e.g. FLOW-WEEKEND" />
            </label>
            <p className="text-xs text-muted-foreground">{modal === 'create' ? 'Use 4–30 letters, numbers or hyphens. Students join using this code.' : 'The class code cannot be changed.'}</p>
            {modal !== 'create' && <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />Class is active</label>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 hover:bg-secondary rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">{saving ? 'Saving…' : modal === 'create' ? 'Create' : 'Save Changes'}</button>
            </div>
          </fieldset>
        </form>
      </Modal>}
    </div>
  </DashboardLayout>
}
