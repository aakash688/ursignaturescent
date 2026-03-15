'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

interface CouponRow {
  id: string
  code: string
  type: string
  value: number
  min_order_value: number | null
  max_discount: number | null
  usage_limit: number | null
  used_count: number
  per_user_limit: number | null
  expires_at: string | null
  is_active: boolean
}

const defaultForm = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 10,
  min_order_value: '',
  max_discount: '',
  usage_limit: '',
  per_user_limit: '',
  expires_at: '',
  is_active: true,
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export default function AdminCouponsPage() {
  const [list, setList] = useState<CouponRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saveLoading, setSaveLoading] = useState(false)
  const [editing, setEditing] = useState<CouponRow | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/coupons')
      .then((res) => res.json())
      .then((d) => {
        setList(Array.isArray(d) ? d : d.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setForm({ ...defaultForm, code: generateCode() })
    setEditing(null)
    setModal(true)
  }

  const openEdit = (c: CouponRow) => {
    setForm({
      code: c.code,
      type: c.type as 'percentage' | 'fixed',
      value: c.value,
      min_order_value: c.min_order_value != null ? String(c.min_order_value) : '',
      max_discount: c.max_discount != null ? String(c.max_discount) : '',
      usage_limit: c.usage_limit != null ? String(c.usage_limit) : '',
      per_user_limit: c.per_user_limit != null ? String(c.per_user_limit) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
      is_active: c.is_active,
    })
    setEditing(c)
    setModal(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    const url = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons'
    const method = editing ? 'PUT' : 'POST'
    const body = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaveLoading(false)
    if (res.ok) {
      setModal(false)
      load()
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to save')
    }
  }

  const toggleActive = async (c: CouponRow) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    })
    if (res.ok) load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl text-ivory">Coupons</h1>
        <Button onClick={openCreate}>Create Coupon</Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Min order</th>
                <th className="p-3">Used / Limit</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Active</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-ivory font-mono">{c.code}</td>
                  <td className="p-3 text-smoke">{c.type}</td>
                  <td className="p-3 text-smoke">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                  <td className="p-3 text-smoke">{c.min_order_value != null ? formatPrice(c.min_order_value) : '—'}</td>
                  <td className="p-3 text-smoke">{c.used_count} / {c.usage_limit ?? '∞'}</td>
                  <td className="p-3 text-smoke">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${c.is_active ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-smoke'}`}>
                      {c.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(c)} className="text-gold hover:underline text-xs">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleActive(c)} className="text-smoke hover:text-ivory text-xs">
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && list.length === 0 && <p className="p-12 text-center text-smoke">No coupons.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setModal(false)}>
          <div className="bg-noir border border-white/10 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg text-ivory mb-4">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="flex gap-2">
                <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required className="font-mono" />
                {!editing && (
                  <Button type="button" variant="outline" onClick={() => setForm((f) => ({ ...f, code: generateCode() }))} className="mt-6">
                    Generate
                  </Button>
                )}
              </div>
              <div>
                <label className="block text-sm text-smoke mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <Input label="Value" type="number" value={String(form.value)} onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))} required />
              <Input label="Min order value" type="number" value={form.min_order_value} onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))} />
              <Input label="Max discount" type="number" value={form.max_discount} onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value }))} />
              <Input label="Usage limit" type="number" value={form.usage_limit} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))} />
              <Input label="Per user limit" type="number" value={form.per_user_limit} onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value }))} />
              <Input label="Expires at" type="datetime-local" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm text-ivory">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saveLoading} disabled={saveLoading}>
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
