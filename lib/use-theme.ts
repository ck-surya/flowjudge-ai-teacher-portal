'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    try {
      const saved = localStorage.getItem('flowjudge-theme')
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.classList.toggle('dark', saved === 'dark')
        document.documentElement.classList.toggle('light', saved === 'light')
      }
    } catch { /* The preference still works when browser storage is disabled. */ }
    sync()
    window.addEventListener('flowjudge-theme-change', sync)
    const syncStorage = (event: StorageEvent) => {
      if (event.key !== 'flowjudge-theme') return
      const next = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.classList.toggle('light', next === 'light')
      sync()
      window.dispatchEvent(new Event('flowjudge-theme-change'))
    }
    window.addEventListener('storage', syncStorage)
    return () => {
      window.removeEventListener('flowjudge-theme-change', sync)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])
  const changeTheme = (next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.classList.toggle('light', next === 'light')
    setTheme(next)
    try { localStorage.setItem('flowjudge-theme', next) } catch { /* Optional persistence. */ }
    window.dispatchEvent(new Event('flowjudge-theme-change'))
  }
  return { theme, changeTheme }
}
