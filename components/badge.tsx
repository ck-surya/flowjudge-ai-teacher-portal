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
  good: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  average: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  warning: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
  error: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
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
