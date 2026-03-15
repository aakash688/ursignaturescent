import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/account/profile')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-ivory mb-10">Profile</h1>
      <ProfileForm user={user} profile={profile} />
      <div className="mt-12">
        <h2 className="font-display text-xl text-ivory mb-4">Saved addresses</h2>
        {addresses?.length ? (
          <ul className="space-y-4">
            {addresses.map((a) => (
              <li key={a.id} className="p-4 rounded-lg border border-white/10">
                <p className="text-ivory font-medium">{a.name} {a.is_default && <span className="text-gold text-sm">(Default)</span>}</p>
                <p className="text-smoke text-sm">{a.address_line1}, {a.city}, {a.state} {a.pincode}</p>
                <p className="text-smoke text-sm">{a.phone}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-smoke">No saved addresses. Add one at checkout.</p>
        )}
      </div>
      <Link href="/account" className="inline-block mt-8">
        <Button variant="ghost">← Back to account</Button>
      </Link>
    </div>
  )
}
