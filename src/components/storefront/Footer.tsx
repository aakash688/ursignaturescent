import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

const footerLinks = {
  Shop: [
    { href: '/collections', label: 'All Collections' },
    { href: '/collections/men', label: 'Men' },
    { href: '/collections/women', label: 'Women' },
    { href: '/collections/unisex', label: 'Unisex' },
  ],
  Support: [
    { href: '/shipping', label: 'Shipping Policy' },
    { href: '/returns', label: 'Return Policy' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ],
}

function cleanUrl(url: string | undefined, defaultPath: string): string {
  if (!url || !url.trim()) return defaultPath
  const u = url.trim()
  if (u.startsWith('http')) return u
  if (u.startsWith('instagram.com') || u.includes('instagram.com')) return `https://${u.replace(/^https?:\/\//, '')}`
  return u.startsWith('/') ? `https://instagram.com${u}` : `https://instagram.com/${u.replace(/^@/, '')}`
}

function cleanWhatsApp(num: string | undefined): string {
  if (!num || !num.trim()) return '919999999999'
  return num.replace(/\D/g, '').replace(/^0/, '') || '919999999999'
}

export function Footer({
  logoUrl,
  instagramUrl,
  whatsappNumber,
}: {
  logoUrl?: string | null
  instagramUrl?: string
  whatsappNumber?: string
}) {
  const instagram = cleanUrl(instagramUrl, 'https://instagram.com/ur_signature_')
  const wa = cleanWhatsApp(whatsappNumber)
  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-12 sm:mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Logo src={logoUrl} size="md" variant="brand" href="/" />
            <p className="mt-4 text-smoke text-sm">Your Scent. Your Identity.</p>
            <div className="mt-4 flex gap-4">
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-smoke hover:text-gold transition-colors">Instagram</a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-smoke hover:text-gold transition-colors">WhatsApp</a>
            </div>
          </div>
          <div>
            <h4 className="text-ivory font-display text-lg mb-4">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.Shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-smoke hover:text-gold text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-ivory font-display text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.Support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-smoke hover:text-gold text-sm transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs text-smoke text-center sm:text-left">
            <span>100% Authentic</span>
            <span>Free Shipping ₹999+</span>
            <span>Easy Returns</span>
          </div>
          <p className="text-smoke text-xs" suppressHydrationWarning>
            © {new Date().getFullYear()} URsignature. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
