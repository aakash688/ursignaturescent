export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  is_default: boolean
  name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  product_count?: number
}

/** One image row from product_images table (R2 URL, order, primary flag) */
export interface ProductImage {
  id?: string
  url: string
  sort_order: number
  is_primary: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  short_description: string | null
  inspired_by: string | null
  category_type: 'men' | 'women' | 'unisex'
  fragrance_profile: string | null
  top_notes: string[]
  heart_notes: string[]
  base_notes: string[]
  rating: number
  /** Ordered image URLs (primary first). Populated from product_images or legacy products.images */
  images: string[]
  is_featured: boolean
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  sort_order: number
  created_at: string
  updated_at: string
  variants?: ProductVariant[]
  categories?: Category[]
  product_images?: ProductImage[]
}

export interface ProductVariant {
  id: string
  product_id: string
  size_ml: number
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  product_id: string
  variant_id: string
  name: string
  slug: string
  image: string
  size_ml: number
  price: number
  compare_at_price: number | null
  quantity: number
  max_quantity: number
}

export interface ShippingAddress {
  name: string
  phone: string
  email: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  product_image: string | null
  size_ml: number
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  guest_email: string | null
  guest_phone: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  coupon_code: string | null
  coupon_id: string | null
  shipping_address: ShippingAddress
  shiprocket_order_id: string | null
  tracking_number: string | null
  tracking_url: string | null
  courier_name: string | null
  notes: string | null
  is_pos: boolean
  admin_notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export interface Settings {
  [key: string]: string
}

export interface InventoryTransaction {
  id: string
  variant_id: string
  type: 'sale' | 'restock' | 'adjustment' | 'pos_sale' | 'return'
  quantity_change: number
  quantity_after: number
  order_id: string | null
  note: string | null
  created_by: string | null
  created_at: string
}

export interface AnalyticsEvent {
  event_type: string
  session_id?: string
  user_id?: string
  product_id?: string
  order_id?: string
  metadata?: Record<string, unknown>
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface CheckoutState {
  step: 1 | 2 | 3
  address: Partial<ShippingAddress>
  couponCode: string
  appliedCoupon: { id: string; code: string; type: string; value: number } | null
  discount: number
  shippingCharge: number
}
