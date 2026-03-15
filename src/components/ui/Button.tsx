'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-gold text-noir hover:bg-gold-light active:scale-[0.98]',
      outline: 'border border-gold text-gold hover:bg-gold hover:text-noir',
      ghost: 'text-ivory/70 hover:text-ivory hover:bg-white/5',
      danger: 'bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/40',
    }
    const sizes = {
      sm: 'text-[10px] px-4 py-2 rounded',
      md: 'text-xs px-6 py-3 rounded',
      lg: 'text-xs px-8 py-4 rounded',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 animate-spin" size={14} />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
