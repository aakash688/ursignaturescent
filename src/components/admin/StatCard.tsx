import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/5 bg-[#0f0f0f] p-6',
        className
      )}
    >
      {icon && <div className="mb-2 text-gold">{icon}</div>}
      <p className="text-sm text-smoke uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-2xl font-display text-ivory">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-smoke">{subtitle}</p>}
    </div>
  )
}
