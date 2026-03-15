'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string | null
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-noir flex flex-col lg:flex-row">
      {/* Mobile/tablet: menu button + title bar */}
      <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0a0a] shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded text-ivory hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <span className="font-display text-gold tracking-widest text-sm">URsignature Admin</span>
      </header>

      {/* Overlay when sidebar open on mobile/tablet */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Close menu"
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
        className={cn(
          'fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Sidebar: drawer on mobile/tablet, fixed column on desktop */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transform transition-transform duration-200 ease-out',
          'lg:translate-x-0 lg:w-60 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <AdminSidebar userEmail={userEmail} onCloseNav={() => setSidebarOpen(false)} />
      </div>

      {/* Main content: responsive padding for mobile / tablet / desktop */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 min-h-full" data-admin-main>
          {children}
        </div>
      </main>
    </div>
  )
}
