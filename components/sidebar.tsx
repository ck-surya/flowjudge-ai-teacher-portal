'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, FileText, CheckCircle, Settings, Menu, X, User } from 'lucide-react'

const navItems = [
  { href: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/classes', label: 'Classes', icon: BookOpen },
  { href: '/teacher/submissions', label: 'Submissions', icon: FileText },
  { href: '/teacher/reviews', label: 'Review Requests', icon: CheckCircle },
]

interface SidebarProps {
  isCollapsed?: boolean
  toggleSidebar?: () => void
}

export function Sidebar({ isCollapsed = false, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/teacher') return pathname === '/teacher' || pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 text-foreground"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsOpen(false)} />}

      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-30 flex flex-col md:relative md:z-0 md:translate-x-0 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className={`p-6 border-b border-border flex items-center h-[89px] ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex items-center gap-3 w-full justify-center overflow-hidden">
            {toggleSidebar && (
              <button onClick={toggleSidebar} className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors hidden md:block shrink-0">
                <Menu size={20} />
              </button>
            )}
            <img src="/logo.png" alt="FlowJudge Logo" className="w-8 h-8 shrink-0 object-contain" />
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex flex-col justify-center ${isCollapsed ? 'w-0 opacity-0' : 'w-[120px] opacity-100'}`}>
              <h1 className="font-bold text-foreground leading-tight">FlowJudge</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Teacher Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
              >
                <Icon size={20} className="shrink-0" />
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-[140px] opacity-100'}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/settings" className="block">
            <div className={`py-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-all flex items-center cursor-pointer ${isCollapsed ? 'px-2 justify-center' : 'px-4'}`}>
              {isCollapsed ? (
                <User size={20} className="text-foreground shrink-0" />
              ) : (
                <div className="overflow-hidden whitespace-nowrap">
                  <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
                  <p className="font-medium text-sm text-foreground truncate w-full">Teacher Account</p>
                </div>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
