import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartDrawer } from '@/components/storefront/CartDrawer'
import { Preloader } from '@/components/storefront/Preloader'
import { GoldCursor } from '@/components/ui/GoldCursor'
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton'
import { Providers } from '@/components/shared/Providers'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <Preloader />
      <GoldCursor />
      <div className="use-gold-cursor min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <WhatsAppButton />
    </Providers>
  )
}
