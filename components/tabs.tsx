'use client'

import { useEffect, useId, useRef, useState } from 'react'

type Tab = { id: string; label: string; content: React.ReactNode }
export function Tabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const groupId = useId()
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const ids = tabs.map(tab => tab.id).join(',')
  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1)
      if (ids.split(',').includes(id)) setActiveTab(id)
    }
    syncHash()
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [ids])
  const select = (id: string) => {
    setActiveTab(id)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  }
  return <div>
    <div role="tablist" aria-label="Class sections" className="border-b border-border mb-6 flex gap-8 overflow-x-auto">
      {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab"
        id={`${groupId}-${tab.id}-tab`} aria-controls={`${groupId}-${tab.id}-panel`}
        aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1}
        ref={element => { buttons.current[index] = element }}
        onClick={() => select(tab.id)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
            : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
          if (next !== null) { event.preventDefault(); select(tabs[next].id); buttons.current[next]?.focus() }
        }}
        className={`pb-4 px-1 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >{tab.label}</button>)}
    </div>
    <div role="tabpanel" id={`${groupId}-${activeTab}-panel`} aria-labelledby={`${groupId}-${activeTab}-tab`}>
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  </div>
}
