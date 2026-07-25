'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { ClassCard } from '@/components/class-card'

const mockClasses = [
  {
    id: '1',
    name: 'Programming Fundamentals',
    code: 'PF-CSEA-26',
    students: 45,
    modules: 5,
    pendingReviews: 12,
  },
  {
    id: '2',
    name: 'Advanced Algorithms',
    code: 'AA-CSEA-26',
    students: 32,
    modules: 7,
    pendingReviews: 8,
  },
  {
    id: '3',
    name: 'Data Structures',
    code: 'DS-CSEA-26',
    students: 38,
    modules: 6,
    pendingReviews: 5,
  },
  {
    id: '4',
    name: 'Web Development Basics',
    code: 'WD-CSEA-26',
    students: 69,
    modules: 8,
    pendingReviews: 9,
  },
]

export default function ClassesPage() {
  return (
    <DashboardLayout
      title="Classes"
      subtitle="Manage your programming classes"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((classItem) => (
          <ClassCard key={classItem.id} {...classItem} />
        ))}
      </div>
    </DashboardLayout>
  )
}
