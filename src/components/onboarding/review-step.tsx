'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

interface ReviewStepProps {
  tenantId: string
  onNext: () => void
  onBack: () => void
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

interface ServiceEntry {
  name: string
  description: string
  price: string
  duration: string
}

interface HoursEntry {
  enabled: boolean
  open: string
  close: string
}

interface FaqEntry {
  question: string
  answer: string
}

export function ReviewStep({ tenantId, onNext, onBack }: ReviewStepProps) {
  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    email: '',
    website: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postcode: '',
  })
  const [services, setServices] = useState<ServiceEntry[]>([])
  const [hours, setHours] = useState<Record<string, HoursEntry>>(() => {
    const defaults: Record<string, HoursEntry> = {}
    DAYS.forEach((day) => {
      defaults[day] = {
        enabled: day !== 'sunday',
        open: '09:00',
        close: day === 'saturday' ? '16:00' : '18:00',
      }
    })
    return defaults
  })
  const [faqs, setFaqs] = useState<FaqEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [configResult, servicesResult] = await Promise.all([
        supabase.from('business_config').select('*').eq('tenant_id', tenantId).single(),
        supabase
          .from('services')
          .select('name, description, price_cents, duration_minutes')
          .eq('tenant_id', tenantId)
          .order('sort_order'),
      ])

      const data = configResult.data
      if (data) {
        const addr = (data.address || {}) as any
        setForm({
          business_name: data.business_name || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          address_street: addr.street || '',
          address_city: addr.city || '',
          address_state: addr.state || '',
          address_postcode: addr.postcode || '',
        })

        if (data.hours && typeof data.hours === 'object') {
          const h: Record<string, HoursEntry> = {}
          DAYS.forEach((day) => {
            const d = (data.hours as any)?.[day]
            h[day] = d
              ? { enabled: true, open: d.open || '09:00', close: d.close || '18:00' }
              : { enabled: false, open: '09:00', close: '18:00' }
          })
          setHours(h)
        }

        if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(
            data.faqs.map((f: any) => ({ question: f.question || '', answer: f.answer || '' }))
          )
        }
      }

      if (servicesResult.data && servicesResult.data.length > 0) {
        setServices(
          servicesResult.data.map((s: any) => ({
            name: s.name || '',
            description: s.description || '',
            price: s.price_cents ? (s.price_cents / 100).toString() : '',
            duration: s.duration_minutes ? s.duration_minutes.toString() : '',
          }))
        )
      }

      setLoading(false)
    }
    load()
  }, [tenantId, supabase])

  // Service CRUD
  const addService = () =>
    setServices([...services, { name: '', description: '', price: '', duration: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: keyof ServiceEntry, value: string) => {
    const updated = [...services]
    updated[i] = { ...updated[i], [field]: value }
    setServices(updated)
  }

  // FAQ CRUD
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }])
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i))
  const updateFaq = (i: number, field: keyof FaqEntry, value: string) => {
    const updated = [...faqs]
    updated[i] = { ...updated[i], [field]: value }
    setFaqs(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const hoursJson: Record<string, { open: string; close: string } | null> = {}
    DAYS.forEach((day) => {
      hoursJson[day] = hours[day].enabled
        ? { open: hours[day].open, close: hours[day].close }
        : null
    })

    await supabase
      .from('business_config')
      .update({
        business_name: form.business_name,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: {
          street: form.address_street,
          city: form.address_city,
          state: form.address_state,
          postcode: form.address_postcode,
        },
        hours: hoursJson,
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      })
      .eq('tenant_id', tenantId)

    await supabase
      .from('tenants')
      .update({ name: form.business_name })
      .eq('id', tenantId)

    // Upsert services
    const validServices = services.filter((s) => s.name.trim())
    await supabase.from('services').delete().eq('tenant_id', tenantId)
    if (validServices.length > 0) {
      await supabase.from('services').insert(
        validServices.map((s, idx) => ({
          tenant_id: tenantId,
          name: s.name.trim(),
          description: s.description.trim() || null,
          price_cents: s.price ? Math.round(parseFloat(s.price) * 100) : null,
          price_type: 'fixed' as const,
          duration_minutes: s.duration ? parseInt(s.duration) : null,
          is_active: true,
          sort_order: idx,
        }))
      )
    }

    setSaving(false)
    onNext()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--ink)]" />
      </div>
    )
  }

  const inputClasses =
    'w-full px-3 py-2 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-shadow'

  const hasContact = form.business_name && (form.phone || form.email)
  const hasHours = Object.values(hours).some((h) => h.enabled)
  const hasServices = services.length > 0
  const hasFaqs = faqs.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">Review &amp; refine</h2>
        <p className="mt-1 text-sm text-[var(--ink-faint)]">
          Everything below was pre-filled from your website and AI conversation. Check it looks
          right.
        </p>
      </div>

      {/* Completion chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Contact', done: hasContact },
          { label: 'Hours', done: hasHours },
          { label: 'Services', done: hasServices },
          { label: 'FAQs', done: hasFaqs },
        ].map((s) => (
          <span
            key={s.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
              s.done
                ? 'bg-[rgba(43,114,107,0.1)] text-[var(--teal)]'
                : 'bg-[var(--surface-muted)] text-[var(--ink-faint)]'
            )}
          >
            {s.done ? (
              <Icons.Check className="h-3 w-3" />
            ) : (
              <Icons.Circle className="h-3 w-3" />
            )}
            {s.label}
          </span>
        ))}
      </div>

      {/* Contact details */}
      <section className="space-y-4 rounded-2xl border border-[var(--line)] p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Icons.Building2 className="h-4 w-4 text-[var(--ink-faint)]" />
          Contact details
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">
              Business name
            </label>
            <input
              required
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+61 4XX XXX XXX"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">
              Street address
            </label>
            <input
              value={form.address_street}
              onChange={(e) => setForm({ ...form, address_street: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">
              City / Suburb
            </label>
            <input
              value={form.address_city}
              onChange={(e) => setForm({ ...form, address_city: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">
                State
              </label>
              <select
                value={form.address_state}
                onChange={(e) => setForm({ ...form, address_state: e.target.value })}
                className={inputClasses}
              >
                <option value="">Select</option>
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--ink-faint)]">
                Postcode
              </label>
              <input
                value={form.address_postcode}
                onChange={(e) => setForm({ ...form, address_postcode: e.target.value })}
                maxLength={4}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="space-y-3 rounded-2xl border border-[var(--line)] p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
          <Icons.Clock className="h-4 w-4 text-[var(--ink-faint)]" />
          Business hours
        </h3>
        <div className="space-y-1.5">
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/40 px-3 py-2"
            >
              <label className="flex w-24 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={hours[day].enabled}
                  onChange={(e) =>
                    setHours({ ...hours, [day]: { ...hours[day], enabled: e.target.checked } })
                  }
                  className="h-3.5 w-3.5 rounded border-[var(--line)] accent-[var(--teal)]"
                />
                <span className="text-xs font-medium capitalize text-[var(--ink)]">{day}</span>
              </label>
              {hours[day].enabled ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={(e) =>
                      setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })
                    }
                    className="rounded-lg border border-[var(--line)] px-1.5 py-1 text-xs text-[var(--ink)]"
                  />
                  <span className="text-[var(--ink-faint)]">to</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={(e) =>
                      setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })
                    }
                    className="rounded-lg border border-[var(--line)] px-1.5 py-1 text-xs text-[var(--ink)]"
                  />
                </div>
              ) : (
                <span className="text-xs text-[var(--ink-faint)]">Closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="space-y-3 rounded-2xl border border-[var(--line)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <Icons.Briefcase className="h-4 w-4 text-[var(--ink-faint)]" />
            Services &amp; pricing
          </h3>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-white/90 transition-colors"
          >
            <Icons.Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {services.length === 0 ? (
          <button
            type="button"
            onClick={addService}
            className="w-full rounded-xl border border-dashed border-[var(--line)] py-4 text-xs text-[var(--ink-faint)] hover:border-[var(--ink-faint)] transition-colors"
          >
            Add your first service
          </button>
        ) : (
          <div className="space-y-2">
            {services.map((svc, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] bg-white/40 px-3 py-2">
                <div className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                    <input
                      value={svc.name}
                      onChange={(e) => updateService(i, 'name', e.target.value)}
                      placeholder="Name *"
                      className={cn(inputClasses, 'py-1.5 text-xs')}
                    />
                    <input
                      value={svc.description}
                      onChange={(e) => updateService(i, 'description', e.target.value)}
                      placeholder="Description"
                      className={cn(inputClasses, 'py-1.5 text-xs')}
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-faint)]">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={svc.price}
                        onChange={(e) => updateService(i, 'price', e.target.value)}
                        placeholder="Price"
                        className={cn(inputClasses, 'py-1.5 pl-6 text-xs')}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={svc.duration}
                        onChange={(e) => updateService(i, 'duration', e.target.value)}
                        placeholder="Duration"
                        className={cn(inputClasses, 'py-1.5 text-xs')}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--ink-faint)]">
                        min
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(i)}
                    className="rounded p-1 text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.1)] hover:text-[var(--error)] transition-colors"
                  >
                    <Icons.X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQs */}
      <section className="space-y-3 rounded-2xl border border-[var(--line)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <Icons.HelpCircle className="h-4 w-4 text-[var(--ink-faint)]" />
            FAQs
          </h3>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white/70 px-2.5 py-1 text-xs font-medium text-[var(--ink)] hover:bg-white/90 transition-colors"
          >
            <Icons.Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {faqs.length === 0 ? (
          <p className="py-2 text-xs text-[var(--ink-faint)]">
            No FAQs yet — your AI will handle common questions with general knowledge.
          </p>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] bg-white/40 px-3 py-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={faq.question}
                      onChange={(e) => updateFaq(i, 'question', e.target.value)}
                      placeholder="Question"
                      className={cn(inputClasses, 'py-1.5 text-xs')}
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                      placeholder="Answer"
                      rows={2}
                      className={cn(inputClasses, 'resize-none py-1.5 text-xs')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaq(i)}
                    className="rounded p-1 text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.1)] hover:text-[var(--error)] transition-colors"
                  >
                    <Icons.X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="flex justify-between border-t border-[var(--surface-muted)] pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-5 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-ghost)] transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={saving || !form.business_name}
          className="px-6 py-2 bg-[var(--teal)] text-white text-sm font-medium rounded-xl hover:bg-[var(--teal-strong)] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
