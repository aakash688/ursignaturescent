import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
  getIsEmpty: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.variant_id === item.variant_id)
          if (existing) {
            const newQty = Math.min(
              existing.quantity + item.quantity,
              item.max_quantity
            )
            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id ? { ...i, quantity: newQty } : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, item], isOpen: true }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variantId),
        }))
      },

      updateQuantity: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variantId
              ? { ...i, quantity: Math.min(qty, i.max_quantity) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getIsEmpty: () => get().items.length === 0,
    }),
    {
      name: 'ursignature-cart',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
