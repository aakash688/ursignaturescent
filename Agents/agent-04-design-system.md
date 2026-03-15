# CURSOR AGENT 04 — Luxury Design System & UI Components

## Your Role
You are a luxury brand UI engineer. Build URsignature's complete design system — every reusable component that will be used across the storefront and admin. This is a PREMIUM, MINIMALIST, DARK-LUXURY aesthetic.

## Design Direction
- **Aesthetic**: Dark luxury. Think high-end perfume boutique. Moody, editorial, sensuous.
- **Primary BG**: Near-black `#0A0A0A` (noir)
- **Accent**: Champagne gold `#C9A84C`
- **Text**: Ivory `#F5F0E8` for headings, `#9B9B9B` for body
- **Cards**: `#111111` with subtle gold border on hover
- **Font**: Cormorant Garamond for all headings (elegant serif), DM Sans for body
- **Spacing**: Generous. Luxury is about what you DON'T show.
- **Animations**: Smooth, slow fades. Never jarring.

---

## Task: Build All UI Components

### Step 1: Update `src/styles/globals.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --noir: #0A0A0A;
  --gold: #C9A84C;
  --gold-light: #E2C87A;
  --ivory: #F5F0E8;
  --smoke: #6B6B6B;
  --charcoal: #111111;
  --mist: #1E1E1E;
  --border: rgba(201, 168, 76, 0.15);
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  background-color: var(--noir);
  color: var(--ivory);
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--noir); }
::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

/* Selection color */
::selection { background: var(--gold); color: var(--noir); }

/* Typography utilities */
.font-display { font-family: 'Cormorant Garamond', serif; }
.font-body { font-family: 'DM Sans', sans-serif; }

/* Gold shimmer text effect */
.text-gold-shimmer {
  background: linear-gradient(105deg, #C9A84C 0%, #F0D98A 40%, #C9A84C 60%, #9A7A30 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  to { background-position: 200% center; }
}

/* Luxury divider */
.divider-gold {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
```

---

### Step 2: Build Core UI Components

**`src/components/ui/Button.tsx`**
```tsx
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-body font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-gold text-noir hover:bg-gold-light active:scale-[0.98]',
      outline: 'border border-gold text-gold hover:bg-gold hover:text-noir',
      ghost: 'text-ivory/70 hover:text-ivory hover:bg-white/5',
      danger: 'bg-red-900/20 text-red-400 border border-red-900/30 hover:bg-red-900/40',
    }
    
    const sizes = {
      sm: 'text-[10px] px-4 py-2 rounded',
      md: 'text-xs px-6 py-3 rounded',
      lg: 'text-xs px-8 py-4 rounded',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 animate-spin" size={14} />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

**`src/components/ui/Badge.tsx`**
```tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'smoke' | 'success' | 'error' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'gold', className }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/10 text-gold border border-gold/20',
    smoke: 'bg-white/5 text-smoke border border-white/10',
    success: 'bg-green-900/20 text-green-400 border border-green-900/30',
    error: 'bg-red-900/20 text-red-400 border border-red-900/30',
    warning: 'bg-amber-900/20 text-amber-400 border border-amber-900/30',
  }
  return (
    <span className={cn('inline-flex items-center text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-sm', variants[variant], className)}>
      {children}
    </span>
  )
}
```

**`src/components/ui/Input.tsx`**
```tsx
import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-medium text-smoke tracking-wider uppercase">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full bg-charcoal border border-white/10 text-ivory placeholder:text-smoke/50',
          'px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50 transition-colors',
          error && 'border-red-900/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-smoke">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'
```

**`src/components/ui/Card.tsx`**
```tsx
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-charcoal border border-white/5 rounded-lg',
        hover && 'cursor-pointer hover:border-gold/30 transition-colors duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
```

**`src/components/ui/StarRating.tsx`**
```tsx
interface StarRatingProps {
  rating: number
  max?: number
  size?: number
}

export function StarRating({ rating, max = 5, size = 12 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.floor(rating) ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}
```

---

### Step 3: Build Storefront Layout Components

**`src/components/storefront/Header.tsx`**
Create a sticky header with:
- URsignature logo (left) — use SVG text logo with Cormorant Garamond
- Nav links: Collections | Men | Women | Unisex
- Right: Search icon, Account icon, Cart icon with item count badge
- On scroll: background becomes solid charcoal with blur
- Mobile: hamburger menu that slides in from left
- Announcement bar above header showing `settings.announcement_bar`

**`src/components/storefront/Footer.tsx`**
Create a luxury footer with:
- Logo + tagline "Your Scent. Your Identity."
- Links: Collections, About, FAQ, Shipping Policy, Return Policy, Privacy Policy, Contact
- Social links: Instagram, WhatsApp
- "Shop with Confidence" section: 100% Authentic | Free Shipping ₹999+ | Easy Returns
- Copyright text
- Background: `#050505`

**`src/components/storefront/ProductCard.tsx`**
```tsx
// Key features:
// - Dark card with product image (aspect-ratio: 4/5)
// - On hover: image zooms slightly, "Add to Cart" button slides up from bottom
// - Shows product name (Cormorant), tagline, price
// - Star rating
// - "Inspired by [brand]" in small gold text
// - Out of stock overlay if stock = 0
// - NEW / FEATURED badges
```

**`src/components/storefront/NotesBadge.tsx`**
A small component that shows top/heart/base notes as elegant pill tags.

**`src/components/storefront/CartDrawer.tsx`**
A slide-in cart from the right side:
- Shows all cart items with image, name, size, quantity controls, price
- Coupon code input field
- Order summary: subtotal, discount, shipping, total
- "Proceed to Checkout" CTA button (gold)
- "Free shipping on orders above ₹999" progress bar

---

### Step 4: Build Admin Layout

**`src/components/admin/AdminLayout.tsx`**
Sidebar navigation (collapsible) with:
- URsignature logo
- Nav items with icons: Dashboard, Products, Categories, Orders, Inventory, Customers, Coupons, POS, Analytics, Settings
- Active state: gold left border + gold text
- Bottom: admin user avatar + logout

**`src/components/admin/StatCard.tsx`**
```tsx
// Shows: icon, label, value, % change vs yesterday/last week
// Variants: revenue (gold), orders (blue), customers (green), inventory alerts (amber)
```

---

### COMPLETION CRITERIA
- [ ] globals.css with all CSS variables and custom styles
- [ ] Button, Badge, Input, Card, StarRating components built
- [ ] Header with announcement bar, cart count, sticky scroll behavior
- [ ] Footer with all links
- [ ] ProductCard with hover animations and out-of-stock state
- [ ] CartDrawer with full functionality
- [ ] Admin sidebar layout
- [ ] All components use brand tokens (gold, noir, ivory, smoke)
- [ ] All fonts loading correctly (Cormorant Garamond + DM Sans)
