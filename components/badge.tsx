interface BadgeProps {
  variant:
    | 'default'
    | 'good'
    | 'average'
    | 'warning'
    | 'error'
    | 'processing'
    | 'success'
  children: React.ReactNode
}

const variantClasses = {
  default: 'bg-secondary text-foreground',
  good: 'bg-green-100 text-green-700',
  average: 'bg-amber-100 text-amber-700',
  warning: 'bg-orange-100 text-orange-700',
  error: 'bg-rose-100 text-rose-700',
  processing: 'bg-blue-100 text-blue-700',
  success: 'bg-green-100 text-green-700',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
