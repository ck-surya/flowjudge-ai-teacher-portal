import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface ModuleCardProps {
  id: string
  classId: string
  name: string
  description: string
  problemCount: number
  completionPercentage: number
}

export function ModuleCard({
  id,
  classId,
  name,
  description,
  problemCount,
  completionPercentage,
}: ModuleCardProps) {
  return (
    <Link href={`/teacher/classes/${classId}/modules/${id}`}>
      <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">{name}</h3>
          <ChevronRight className="text-muted-foreground" size={18} />
        </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{problemCount} problems</span>
          <span className="text-xs font-medium text-foreground">{completionPercentage}%</span>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
        </div>
      </div>
    </Link>
  )
}
