'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, User, Sun, Moon, LogOut, Settings } from 'lucide-react'
import { useTheme } from '@/lib/use-theme'
import { errorMessage } from '@/lib/api-client'
import { ReviewNotifications } from './review-notifications'
import { logoutTeacher, type Teacher } from '@/lib/teacherService'

interface HeaderProps {
  teacher: Teacher | null
  title: string
  subtitle?: string
}

export function Header({ title, subtitle, teacher }: HeaderProps) {
  const [logoutError, setLogoutError] = useState('')
  const { theme, changeTheme } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(event.target as Node)) setShowUser(false)
    }
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setShowNotifs(false); setShowUser(false) } }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('keydown', handleEscape) }
  }, [])

  const toggleTheme = () => changeTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <header className="bg-card border-b border-border sticky top-0 z-20">
      {logoutError && <p role="alert" className="p-2 text-destructive">{logoutError}</p>}
      <div className="flex items-center justify-between gap-2 pl-14 pr-4 md:px-6 py-4">
        <div className="min-w-0 flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-4 shrink-0">
          <button aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} onClick={toggleTheme} className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button aria-label="Review notifications" aria-expanded={showNotifs} onClick={() => { setShowNotifs(!showNotifs); setShowUser(false) }} className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              <Bell size={20} />

            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Review Requests</h3>

                </div>
                <ReviewNotifications onNavigate={() => setShowNotifs(false)} />
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button aria-label="Account menu" aria-expanded={showUser} onClick={() => { setShowUser(!showUser); setShowNotifs(false) }} className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              <User size={20} />
            </button>
            {showUser && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{teacher?.name ?? 'Teacher Account'}</p>
                  <p className="text-xs text-muted-foreground truncate">{teacher?.email ?? ''}</p>
                </div>
                <Link href="/settings" onClick={() => setShowUser(false)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors">
                  <Settings size={16} />
                  Settings
                </Link>
                <button disabled={loggingOut} onClick={async () => { setLoggingOut(true); try { await logoutTeacher() } catch (error) { setLogoutError(errorMessage(error)) } finally { setLoggingOut(false) } }} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary flex items-center gap-2 transition-colors border-t border-border/50">
                  <LogOut size={16} />
                  {loggingOut ? 'Signing out…' : 'Log out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
