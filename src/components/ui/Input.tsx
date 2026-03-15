'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-smoke tracking-wider uppercase">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-charcoal border border-white/10 text-ivory placeholder:text-smoke/50',
          'px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors',
          error && 'border-red-900/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-smoke">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'
