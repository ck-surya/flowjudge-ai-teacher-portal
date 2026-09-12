'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    try {
      const saved = localStorage.getItem('flowjudge-theme')
      if (saved === 'light' || saved === 'dark') document.documentElement.classList.toggle('dark', saved === 'dark')
    } catch { /* The preference still works when browser storage is disabled. */ }
    sync()
    window.addEventListener('flowjudge-theme-change', sync)
    return () => window.removeEventListener('flowjudge-theme-change', sync)
  }, [])
  const changeTheme = (next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    setTheme(next)
    try { localStorage.setItem('flowjudge-theme', next) } catch { /* Optional persistence. */ }
    window.dispatchEvent(new Event('flowjudge-theme-change'))
  }
  return { theme, changeTheme }
}
