'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RequestState } from '@/components/request-state'
import { getTeacher, logoutTeacher } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'
import { useTheme } from '@/lib/use-theme'
import { errorMessage } from '@/lib/api-client'

export default function SettingsPage() {
  const { data: teacher, loading, error, retry } = useRequest(getTeacher)
  const { theme, changeTheme } = useTheme()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  return <DashboardLayout title="Settings" subtitle="Your profile and preferences">
    <div className="max-w-2xl space-y-6">
      <RequestState loading={loading} error={error} onRetry={retry} />
      {teacher && <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Profile</h3>
        <label className="block">Name<input readOnly value={teacher.name} className="block w-full p-2 mt-2 bg-muted border border-border rounded-lg" /></label>
        <label className="block">Email<input readOnly value={teacher.email} className="block w-full p-2 mt-2 bg-muted border border-border rounded-lg" /></label>
        <p className="text-sm text-muted-foreground">Contact your administrator to update your account or password.</p>
      </div>}
      <div className="bg-card border border-border rounded-lg p-6">
        <label>Theme <select value={theme} onChange={e => {
          changeTheme(e.target.value as 'light' | 'dark')
        }} className="ml-4 p-2 bg-card border border-border rounded-lg"><option value="light">Light</option><option value="dark">Dark</option></select></label>
      </div>
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <RequestState error={logoutError} />
        <button disabled={loggingOut} onClick={async () => {
          setLoggingOut(true)
          try { await logoutTeacher() } catch (reason) { setLogoutError(errorMessage(reason)) }
          finally { setLoggingOut(false) }
        }} className="px-4 py-2 bg-destructive text-white rounded-lg disabled:opacity-50">{loggingOut ? 'Signing out…' : 'Log out'}</button>
      </div>
    </div>
  </DashboardLayout>
}
