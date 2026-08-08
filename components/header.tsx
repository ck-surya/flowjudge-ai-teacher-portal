'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell, User, Sun, Moon, LogOut, CheckCircle, Settings, Menu } from 'lucide-react'
import { logoutTeacher } from '@/lib/teacherService'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const [theme, setTheme] = useState('light')
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setTheme('dark')
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(event.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      setTheme('light')
    }
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground truncate">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button onClick={toggleTheme} className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotifs(!showNotifs); setShowUser(false) }} className="relative p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <span className="text-xs text-primary font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col">
                  <Link href="/submissions" onClick={() => setShowNotifs(false)} className="px-4 py-3 hover:bg-secondary flex gap-3 items-start cursor-pointer transition-colors border-b border-border/50">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">New submission received</p>
                      <p className="text-xs text-muted-foreground">Alex Chen submitted Fibonacci Loop</p>
                    </div>
                  </Link>
                  <Link href="/review-requests" onClick={() => setShowNotifs(false)} className="px-4 py-3 hover:bg-secondary flex gap-3 items-start cursor-pointer transition-colors">
                    <Bell className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Review requested</p>
                      <p className="text-xs text-muted-foreground">Maria Garcia requested a manual review</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button onClick={() => { setShowUser(!showUser); setShowNotifs(false) }} className="p-2 text-foreground hover:bg-secondary rounded-lg transition-colors">
              <User size={20} />
            </button>
            {showUser && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Teacher Account</p>
                  <p className="text-xs text-muted-foreground truncate">anita.teacher@example.test</p>
                </div>
                <Link href="/settings" onClick={() => setShowUser(false)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors">
                  <Settings size={16} />
                  Settings
                </Link>
                <button onClick={logoutTeacher} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary flex items-center gap-2 transition-colors border-t border-border/50">
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
