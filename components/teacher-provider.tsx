'use client'

import { createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { getTeacher, type Teacher } from '@/lib/teacherService'
import { useRequest } from '@/lib/use-request'

type TeacherRequest = { data: Teacher | null; loading: boolean; error: string; retry: () => void }
const TeacherContext = createContext<TeacherRequest | null>(null)

export function TeacherProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const protectedPage = /^\/(teacher|classes|submissions|review-requests|students|problems|settings)(\/|$)/.test(pathname)
  const request = useRequest(() => protectedPage ? getTeacher() : Promise.resolve(null), [protectedPage])
  return <TeacherContext.Provider value={request}>{children}</TeacherContext.Provider>
}

export function useTeacher() {
  const teacher = useContext(TeacherContext)
  if (!teacher) throw new Error('TeacherProvider is required.')
  return teacher
}
