'use client'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

const META_EVENT_MAP: Record<string, string> = {
  purchase: 'Purchase',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  view_item: 'ViewContent',
  sign_up: 'CompleteRegistration',
  search: 'Search',
  add_to_wishlist: 'AddToWishlist',
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  if (window.gtag) {
    window.gtag('event', event, params)
  }

  if (window.fbq) {
    const metaEvent = META_EVENT_MAP[event]
    if (metaEvent) {
      window.fbq('track', metaEvent, params)
    }
  }
}

export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return
  const path = url || window.location.pathname

  if (window.gtag && process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
      page_path: path,
    })
  }

  if (window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export function trackProductView(product: {
  id: string
  name: string
  category_type: string
  price?: number
}) {
  trackEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category_type,
        price: product.price,
      },
    ],
  })
}

export function trackAddToCart(item: {
  product_id: string
  name: string
  price: number
  quantity: number
  size_ml: number
}) {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.product_id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
        item_variant: `${item.size_ml}ml`,
      },
    ],
  })
}

export function trackPurchase(order: {
  orderNumber: string
  total: number
  subtotal: number
  couponCode?: string | null
  items: Array<{ product_id: string; name: string; price: number; quantity: number }>
}) {
  trackEvent('purchase', {
    transaction_id: order.orderNumber,
    value: order.total,
    currency: 'INR',
    coupon: order.couponCode || undefined,
    items: order.items.map(i => ({
      item_id: i.product_id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  })
}

export function trackBeginCheckout(value: number, itemCount: number) {
  trackEvent('begin_checkout', { currency: 'INR', value, num_items: itemCount })
}
