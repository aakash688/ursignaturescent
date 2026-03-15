import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Tenor_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const tenorSans = Tenor_Sans({
  variable: '--font-tenor',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'URsignature — Premium Inspired Fragrances',
  description: 'Shop luxury inspired fragrances at honest prices. Long-lasting premium perfumes for men, women and unisex.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${tenorSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
