# CURSOR AGENT 06 — Auth & User Portal

## Your Role
Build the complete user authentication flow and customer portal for URsignature using Supabase Auth.

---

## Task: Auth + User Account Pages

### Step 1: Auth Pages

**`src/app/(storefront)/login/page.tsx`**
```
Dark luxury login page:
- URsignature logo at top
- "Welcome Back" heading (Cormorant)
- Email + Password inputs
- "Forgot Password?" link
- Login button (gold, full width)
- Divider "or"
- Google OAuth button (optional)
- "Don't have an account? Sign up" link
- On success: redirect to /account or ?redirect param
```

**`src/app/(storefront)/signup/page.tsx`**
```
Same luxury styling:
- Full Name, Email, Phone, Password, Confirm Password
- Terms checkbox
- Create Account button
- On success: show "Check your email" confirmation
```

### Step 2: Supabase Auth Actions `src/app/auth/actions.ts`
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/account')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { full_name: formData.get('full_name'), phone: formData.get('phone') },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

### Step 3: Account Dashboard `src/app/(storefront)/account/page.tsx`
```
Shows:
- User's name, email, member since date
- Quick stats: Total Orders, Total Spent
- Recent 3 orders with status badges
- Quick links: View All Orders, Edit Profile, Saved Addresses
```

### Step 4: Orders Page `src/app/(storefront)/account/orders/page.tsx`
```
Table/card list of all user orders:
- Order number, date, items count, total, status badge
- Expandable order details: items, shipping address, tracking
- "Track Order" button if shipped (opens Shiprocket tracking URL)
- "Download Invoice" button (generates simple PDF)
```

### Step 5: Profile Page `src/app/(storefront)/account/profile/page.tsx`
```
Edit form for:
- Full Name, Phone
- Password change section
- Saved addresses: add/edit/delete, set default
```

### Step 6: Order Tracking `src/app/(storefront)/track-order/page.tsx`
```
Public page (no login needed):
- Input: Order Number + Email
- On submit: fetch order from DB
- Show order timeline: Confirmed → Processing → Shipped → Delivered
- Show tracking number + courier name
- Link to courier tracking page
```

---

## COMPLETION CRITERIA
- [ ] Login, signup, logout flows working
- [ ] Email confirmation flow
- [ ] Forgot password flow
- [ ] Account dashboard showing real order data
- [ ] Orders list with expandable details
- [ ] Profile editing with address management
- [ ] Public order tracking page
