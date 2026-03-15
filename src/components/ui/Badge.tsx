import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'smoke' | 'success' | 'error' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'gold', className }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/10 text-gold border border-gold/20',
    smoke: 'bg-white/5 text-smoke border border-white/10',
    success: 'bg-green-900/20 text-green-400 border border-green-900/30',
    error: 'bg-red-900/20 text-red-400 border border-red-900/30',
    warning: 'bg-amber-900/20 text-amber-400 border border-amber-900/30',
  }
  return (
    <span className={cn('inline-flex items-center text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-sm', variants[variant], className)}>
      {children}
    </span>
  )
}
