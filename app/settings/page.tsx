'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { LogOut, Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notifications, setNotifications] = useState(true)

  const handleLogout = () => {
    // Handle logout logic
    alert('Logged out successfully')
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your profile and preferences">
      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Profile</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Name</label>
              <input
                type="text"
                defaultValue="Dr. Sarah Johnson"
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                defaultValue="sarah.johnson@university.edu"
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department</label>
              <input
                type="text"
                defaultValue="Computer Science"
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea
                defaultValue="Passionate about teaching programming and software development."
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Preferences</h3>

          <div className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about student submissions</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  notifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    notifications ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Language</p>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
              <select className="px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:border-primary">
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Security</h3>

          <div className="space-y-4">
            <button className="w-full px-4 py-3 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-left">
              Change Password
            </button>

            <button className="w-full px-4 py-3 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-left">
              Two-Factor Authentication
            </button>

            <button className="w-full px-4 py-3 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-left">
              Connected Devices
            </button>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Logout</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out from your account. You&apos;ll need to log in again to access the dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
