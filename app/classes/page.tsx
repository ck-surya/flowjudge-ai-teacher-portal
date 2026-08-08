'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ClassCard } from '@/components/class-card'
import { createClass, updateClass, listClasses, type ClassItem } from '@/lib/teacherService'
import { Plus, Edit2, Archive } from 'lucide-react'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '', isActive: true })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const rows = await listClasses()
      if (mounted) setClasses(rows)
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const created = await createClass({ name: formData.name, code: formData.code })
      setClasses([...classes, created])
      setShowCreateModal(false)
      setFormData({ name: '', code: '', isActive: true })
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) return
    setIsSubmitting(true)
    try {
      const updated = await updateClass(selectedClass.id, { name: formData.name, isActive: formData.isActive })
      if (updated) {
        setClasses(classes.map(c => c.id === updated.id ? updated : c))
      }
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (cls: ClassItem) => {
    setSelectedClass(cls)
    setFormData({ name: cls.name, code: cls.code, isActive: cls.isActive })
    setShowEditModal(true)
  }

  return (
    <DashboardLayout title="Classes" subtitle="Manage your programming classes">
      <div className="space-y-4 relative">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">You have {classes.length} total classes.</p>
          <button
            onClick={() => {
              setFormData({ name: '', code: '', isActive: true })
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Create Class
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="relative group">
              <ClassCard {...classItem} />
              <button 
                onClick={() => openEdit(classItem)}
                className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur text-foreground rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Create New Class</h3>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Class Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Intro to Python" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Class Code</label>
                  <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. CS101" />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedClass && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Edit Class</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Class Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Class Code (Immutable)</label>
                  <input disabled value={formData.code} className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-muted-foreground opacity-50 cursor-not-allowed" />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary bg-background border-border" />
                  <label htmlFor="isActive" className="text-sm font-medium text-foreground">Class is Active</label>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
