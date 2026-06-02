import { Link, Outlet, useNavigate } from 'react-router-dom'

const nav = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/pos', label: 'POS' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/contacts', label: 'Contacts' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/newsletter', label: 'Newsletter' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // Clear any local session; redirect to login. Worker auth uses cookies.
    navigate('/login?redirect=/admin')
  }

  return (
    <div className="min-h-screen flex bg-noir">
      <aside className="w-60 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link to="/admin" className="font-display text-lg text-gold" style={{ fontFamily: 'var(--font-display)' }}>
            URsignature Admin
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block px-3 py-2 rounded text-smoke hover:bg-white/5 hover:text-ivory"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-smoke hover:text-ivory"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-noir">
        <div className="p-6 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
