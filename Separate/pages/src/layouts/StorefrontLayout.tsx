import { Link, Outlet } from 'react-router-dom'

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 bg-noir px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-ivory hover:text-gold transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          URsignature
        </Link>
        <nav className="flex gap-6 text-smoke text-sm md:text-base">
          <Link to="/products" className="hover:text-ivory transition-colors">Products</Link>
          <Link to="/collections" className="hover:text-ivory transition-colors">Collections</Link>
          <Link to="/contact" className="hover:text-ivory transition-colors">Contact</Link>
          <Link to="/track-order" className="hover:text-ivory transition-colors">Track Order</Link>
          <Link to="/account" className="hover:text-ivory transition-colors">Account</Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 px-4 py-8 text-center text-smoke text-sm">
        © URsignature — Your Scent. Your Identity.
      </footer>
    </div>
  )
}
