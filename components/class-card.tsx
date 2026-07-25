import Link from 'next/link'
import { ChevronRight, Users, BookOpen, AlertCircle } from 'lucide-react'

interface ClassCardProps {
  id: string
  name: string
  code: string
  students: number
  modules: number
  pendingReviews: number
}

export function ClassCard({
  id,
  name,
  code,
  students,
  modules,
  pendingReviews,
}: ClassCardProps) {
  return (
    <Link href={`/classes/${id}`}>
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">Code: {code}</p>
          </div>
          <ChevronRight className="text-muted-foreground" size={20} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="font-semibold text-foreground">{students}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Modules</p>
              <p className="font-semibold text-foreground">{modules}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="font-semibold text-foreground">{pendingReviews}</p>
            </div>
          </div>
        </div>

        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Open Class
        </button>
      </div>
    </Link>
  )
}
