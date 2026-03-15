import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-charcoal border border-white/5 rounded-lg',
        hover && 'cursor-pointer hover:border-gold/30 transition-colors duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
