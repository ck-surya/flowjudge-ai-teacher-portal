'use client'

import { listClasses, listModules } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'
import { RequestState } from './request-state'

export function ClassModuleFilters({ classId, moduleId, onClassChange, onModuleChange }: {
  classId: string; moduleId: string; onClassChange: (id: string) => void; onModuleChange: (id: string) => void
}) {
  const classes = useRequest(listClasses)
  const modules = useRequest(() => classId ? listModules(classId) : Promise.resolve([]), [classId])
  return <>
    <label className="text-sm space-y-1">Class
      <select aria-label="Filter by class" value={classId} onChange={e => onClassChange(e.target.value)} disabled={classes.loading} className="block w-full px-3 py-2 bg-card border border-border rounded-lg">
        <option value="">All classes</option>
        {classes.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select>
      <RequestState error={classes.error} onRetry={classes.retry} />
    </label>
    <label className="text-sm space-y-1">Module
      <select aria-label="Filter by module" value={moduleId} onChange={e => onModuleChange(e.target.value)} disabled={!classId || modules.loading} className="block w-full px-3 py-2 bg-card border border-border rounded-lg disabled:opacity-50">
        <option value="">{classId ? 'All modules' : 'Select a class first'}</option>
        {!classId && moduleId && <option value={moduleId}>Selected problem module</option>}
        {modules.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}
      </select>
      <RequestState error={modules.error} onRetry={modules.retry} />
    </label>
  </>
}
