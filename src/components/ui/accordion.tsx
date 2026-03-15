'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type AccordionContextType = {
  value: string | null
  setValue: (v: string | null) => void
  collapsible?: boolean
}

const AccordionContext = createContext<AccordionContextType | null>(null)
const ItemValueContext = createContext<string>('')

export function Accordion({
  type = 'single',
  collapsible = true,
  children,
  className = '',
}: {
  type?: 'single' | 'multiple'
  collapsible?: boolean
  children: ReactNode
  className?: string
}) {
  const [value, setValue] = useState<string | null>(null)
  return (
    <AccordionContext.Provider value={{ value, setValue, collapsible }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  children,
  className = '',
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  return (
    <ItemValueContext.Provider value={value}>
      <div
        data-state={useContext(AccordionContext)?.value === value ? 'open' : 'closed'}
        className={className}
      >
        {children}
      </div>
    </ItemValueContext.Provider>
  )
}

export function AccordionTrigger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ctx = useContext(AccordionContext)
  const itemValue = useContext(ItemValueContext)
  if (!ctx) return null
  const isOpen = ctx.value === itemValue
  const toggle = () => {
    ctx.setValue(isOpen && ctx.collapsible ? null : itemValue)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex w-full items-center justify-between ${className}`}
    >
      {children}
      <ChevronDown size={18} className={`text-smoke transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  )
}

export function AccordionContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ctx = useContext(AccordionContext)
  const itemValue = useContext(ItemValueContext)
  const isOpen = ctx?.value === itemValue
  if (!isOpen) return null
  return <div className={className}>{children}</div>
}
