import { AnnouncementBar } from '@/components/storefront/AnnouncementBar'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { CartDrawer } from '@/components/storefront/CartDrawer'
import { Preloader } from '@/components/storefront/Preloader'
import { GoldCursor } from '@/components/ui/GoldCursor'
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton'
import { Providers } from '@/components/shared/Providers'
import { getPublicSettings } from '@/lib/settings-public'

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getPublicSettings()
  return (
    <Providers>
      <Preloader />
      <GoldCursor />
      <div className="use-gold-cursor min-h-screen flex flex-col">
        <AnnouncementBar initialAnnouncement={settings.announcement_bar} />
        <Header logoUrl={settings.site_logo_url} />
        <main className="flex-1">{children}</main>
        <Footer
          logoUrl={settings.site_logo_url}
          instagramUrl={settings.instagram_url}
          whatsappNumber={settings.whatsapp_number}
        />
      </div>
      <CartDrawer />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </Providers>
  )
}
