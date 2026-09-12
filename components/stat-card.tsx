import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  color?: 'primary' | 'blue' | 'green' | 'amber' | 'rose'
  trend?: {
    value: number
    isPositive: boolean
  }
  href?: string
}

const colorClasses = {
  primary: 'bg-primary text-primary-foreground',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  href,
}: StatCardProps) {
  const CardContent = (
    <div className={`bg-card border border-border rounded-lg p-5 flex items-start justify-between gap-3 h-full ${href ? 'hover:border-primary hover:shadow-md transition-all cursor-pointer' : ''}`}>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend && (
          <p
            className={`text-xs font-medium mt-2 ${
              trend.isPositive ? 'text-green-600' : 'text-rose-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  )

  if (href) {
    // Native fragment navigation emits hashchange for the class tab controller.
    if (href.includes('#')) return <a href={href} className="block w-full h-full">{CardContent}</a>
    return (
      <Link href={href} className="block w-full h-full">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}
