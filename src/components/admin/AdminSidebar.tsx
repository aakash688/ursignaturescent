'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  FolderTree,
  ShoppingCart,
  Warehouse,
  Ticket,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Mail,
  Send,
  Star,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/products/new', label: 'Add Product', icon: PlusSquare },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/pos', label: 'POS', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Send },
  { href: '/admin/contacts', label: 'Contacts', icon: Mail },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
]

export function AdminSidebar({ userEmail, onCloseNav }: { userEmail: string | null; onCloseNav?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-[#0a0a0a] border-r border-white/5">
      <div className="p-4 lg:p-6 border-b border-white/5">
        <Link href="/admin" className="font-display text-lg text-gold tracking-widest" onClick={onCloseNav}>
          URsignature Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-0.5 px-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onCloseNav}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors cursor-pointer',
                    active
                      ? 'bg-gold/10 text-gold border-l-2 border-gold -ml-[2px] pl-[14px]'
                      : 'text-smoke hover:text-ivory hover:bg-white/5'
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-white/5 space-y-2">
        {userEmail && (
          <p className="text-xs text-smoke truncate px-2" title={userEmail}>
            {userEmail}
          </p>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm text-smoke hover:text-ivory hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
