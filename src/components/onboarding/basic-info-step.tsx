'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BUSINESS_TYPE_TEMPLATES,
  matchIndustryToTemplate,
  type BusinessTypeTemplate,
} from '@/lib/onboarding/business-type-templates'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

interface BasicInfoStepProps {
  tenantId: string
  selectedTemplate: BusinessTypeTemplate | null
  onTemplateSelect: (template: BusinessTypeTemplate) => void
  onNext: () => void
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

function getIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    Scissors: Icons.Scissors,
    Wrench: Icons.Wrench,
    Zap: Icons.Zap,
    Thermometer: Icons.Thermometer,
    SprayCan: Icons.SprayCan,
    Car: Icons.Car,
    UtensilsCrossed: Icons.UtensilsCrossed,
    Dumbbell: Icons.Dumbbell,
    Stethoscope: Icons.Stethoscope,
    Home: Icons.Home,
    Calculator: Icons.Calculator,
    Scale: Icons.Scale,
    Camera: Icons.Camera,
    PawPrint: Icons.PawPrint,
    TreePine: Icons.TreePine,
    Briefcase: Icons.Briefcase,
  }
  return iconMap[iconName] || Icons.Briefcase
}

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

export function BasicInfoStep({ tenantId, selectedTemplate, onTemplateSelect, onNext }: BasicInfoStepProps) {
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

  // Website scraping
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [scrapeSuccess, setScrapeSuccess] = useState(false)

  // Services
  const [services, setServices] = useState<ServiceEntry[]>([])

  // Hours
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

  // FAQs
  const [faqs, setFaqs] = useState<FaqEntry[]>([])

  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('business_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()
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
          address_postcode: addr.postcode || addr.zip || '',
        })
        if (data.website) setScrapeUrl(data.website)

        // Load hours
        if (data.hours && typeof data.hours === 'object') {
          const h: Record<string, HoursEntry> = {}
          DAYS.forEach((day) => {
            const dayData = (data.hours as any)?.[day]
            h[day] = dayData
              ? { enabled: true, open: dayData.open || '09:00', close: dayData.close || '18:00' }
              : { enabled: false, open: '09:00', close: '18:00' }
          })
          setHours(h)
        }

        // Load FAQs
        if (data.faqs && Array.isArray(data.faqs)) {
          setFaqs(data.faqs.map((f: any) => ({ question: f.question || '', answer: f.answer || '' })))
        }
      }

      // Load existing services
      const { data: svcData } = await supabase
        .from('services')
        .select('name, description, price_cents, price_type, duration_minutes')
        .eq('tenant_id', tenantId)
        .order('sort_order')
      if (svcData && svcData.length > 0) {
        setServices(
          svcData.map((s: any) => ({
            name: s.name || '',
            description: s.description || '',
            price: s.price_cents ? (s.price_cents / 100).toString() : '',
            duration: s.duration_minutes ? s.duration_minutes.toString() : '',
          }))
        )
      }
    }
    load()
  }, [tenantId, supabase])

  // ── Website scrape ──────────────────────────────────────────
  const handleScrape = async () => {
    if (!scrapeUrl) return
    let url = scrapeUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setScraping(true)
    setScrapeError(null)
    setScrapeSuccess(false)

    try {
      const res = await fetch('/api/onboarding/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) {
        setScrapeError(json.error || 'Failed to import')
        setScraping(false)
        return
      }

      const d = json.data
      // Merge into form — fill empty fields only
      setForm((prev) => ({
        business_name: prev.business_name || d.business_name || '',
        phone: prev.phone || d.phone || '',
        email: prev.email || d.email || '',
        website: prev.website || url,
        address_street: prev.address_street || d.address?.street || '',
        address_city: prev.address_city || d.address?.city || '',
        address_state: prev.address_state || d.address?.state || '',
        address_postcode: prev.address_postcode || d.address?.postcode || '',
      }))

      // Merge services
      if (d.services && d.services.length > 0 && services.length === 0) {
        setServices(
          d.services.map((s: any) => ({
            name: s.name || '',
            description: s.description || '',
            price: s.price || '',
            duration: s.duration || '',
          }))
        )
      }

      // Merge hours
      if (d.hours) {
        setHours((prev) => {
          const updated = { ...prev }
          DAYS.forEach((day) => {
            if (d.hours[day]) {
              updated[day] = { enabled: true, open: d.hours[day].open, close: d.hours[day].close }
            } else if (d.hours[day] === null) {
              updated[day] = { ...updated[day], enabled: false }
            }
          })
          return updated
        })
      }

      // Merge FAQs
      if (d.faqs && d.faqs.length > 0 && faqs.length === 0) {
        setFaqs(d.faqs)
      }

      // Auto-select template
      if (d.industry && !selectedTemplate) {
        const matched = matchIndustryToTemplate(d.industry)
        if (matched) onTemplateSelect(matched)
      }

      setScrapeSuccess(true)
      setTimeout(() => setScrapeSuccess(false), 4000)
    } catch {
      setScrapeError('Network error — please try again')
    } finally {
      setScraping(false)
    }
  }

  // ── Service CRUD ────────────────────────────────────────────
  const addService = () => setServices([...services, { name: '', description: '', price: '', duration: '' }])
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i))
  const updateService = (i: number, field: keyof ServiceEntry, value: string) => {
    const updated = [...services]
    updated[i] = { ...updated[i], [field]: value }
    setServices(updated)
  }

  // ── FAQ CRUD ────────────────────────────────────────────────
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }])
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i))
  const updateFaq = (i: number, field: keyof FaqEntry, value: string) => {
    const updated = [...faqs]
    updated[i] = { ...updated[i], [field]: value }
    setFaqs(updated)
  }

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return
    setSaving(true)

    // Build hours JSONB
    const hoursJson: Record<string, { open: string; close: string } | null> = {}
    DAYS.forEach((day) => {
      hoursJson[day] = hours[day].enabled ? { open: hours[day].open, close: hours[day].close } : null
    })

    // Save business config
    await supabase
      .from('business_config')
      .update({
        business_name: form.business_name,
        industry: selectedTemplate.industry,
        phone: form.phone,
        email: form.email,
        website: form.website || scrapeUrl || '',
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
      .update({ name: form.business_name, business_type: selectedTemplate.id })
      .eq('id', tenantId)

    // Upsert services — delete old ones first, then insert
    const validServices = services.filter((s) => s.name.trim())
    if (validServices.length > 0) {
      await supabase.from('services').delete().eq('tenant_id', tenantId)
      await supabase.from('services').insert(
        validServices.map((s, idx) => ({
          tenant_id: tenantId,
          name: s.name.trim(),
          description: s.description.trim() || null,
          category: selectedTemplate.industry,
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

  const inputClasses =
    'w-full px-3 py-2 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-shadow'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Website import ────────────────────────────────── */}
      <div className="rounded-[24px] border border-dashed border-[rgba(43,114,107,0.3)] bg-[rgba(43,114,107,0.04)] px-5 py-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(43,114,107,0.12)]">
            <Icons.Globe className="h-4 w-4 text-[var(--teal)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Import from your website</p>
            <p className="text-xs text-[var(--ink-faint)]">We&apos;ll extract your business details automatically</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="yourbusiness.com.au"
            disabled={scraping}
            className={cn(inputClasses, 'flex-1')}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleScrape())}
          />
          <button
            type="button"
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl.trim()}
            className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scraping ? (
              <>
                <Icons.Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Icons.Download className="h-4 w-4" />
                Import
              </>
            )}
          </button>
        </div>
        {scrapeError && <p className="mt-2 text-xs text-[var(--error)]">{scrapeError}</p>}
        {scrapeSuccess && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--success)]">
            <Icons.Check className="h-3.5 w-3.5" /> Business details imported — review below
          </p>
        )}
      </div>

      {/* ── Business type selector ─────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">What type of business do you run?</h2>
        <p className="text-sm text-[var(--ink-faint)] mt-1 mb-5">
          This helps us set up the right tools and templates for you.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BUSINESS_TYPE_TEMPLATES.map((template) => {
            const IconComponent = getIcon(template.icon)
            const isSelected = selectedTemplate?.id === template.id
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onTemplateSelect(template)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-colors text-center',
                  isSelected
                    ? 'border-[var(--ink)] bg-[var(--surface-muted)]'
                    : 'border-[var(--line)] hover:border-[var(--ink-faint)] hover:bg-[var(--surface-ghost)]'
                )}
              >
                <IconComponent
                  className={cn('w-5 h-5', isSelected ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]')}
                />
                <span className="text-sm font-medium text-[var(--ink)]">{template.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Contact details ────────────────────────────────── */}
      {selectedTemplate && (
        <>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Business details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Business name *</label>
                <input
                  required
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+61 4XX XXX XXX"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                  className={inputClasses}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Street address</label>
                <input
                  value={form.address_street}
                  onChange={(e) => setForm({ ...form, address_street: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">City / Suburb</label>
                <input
                  value={form.address_city}
                  onChange={(e) => setForm({ ...form, address_city: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">State</label>
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
                  <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">Postcode</label>
                  <input
                    value={form.address_postcode}
                    onChange={(e) => setForm({ ...form, address_postcode: e.target.value })}
                    maxLength={4}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Business hours ────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--ink)]">Business hours</h3>
            <div className="space-y-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-2.5 bg-white/40">
                  <label className="flex items-center gap-2.5 w-28 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hours[day].enabled}
                      onChange={(e) =>
                        setHours({ ...hours, [day]: { ...hours[day], enabled: e.target.checked } })
                      }
                      className="h-4 w-4 rounded border-[var(--line)] text-[var(--teal)] focus:ring-[var(--teal)] accent-[var(--teal)]"
                    />
                    <span className="text-sm font-medium capitalize text-[var(--ink)]">{day}</span>
                  </label>
                  {hours[day].enabled ? (
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="time"
                        value={hours[day].open}
                        onChange={(e) =>
                          setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })
                        }
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-sm text-[var(--ink)]"
                      />
                      <span className="text-[var(--ink-faint)]">to</span>
                      <input
                        type="time"
                        value={hours[day].close}
                        onChange={(e) =>
                          setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })
                        }
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-sm text-[var(--ink)]"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--ink-faint)]">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Services / pricing ────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">Services &amp; pricing</h3>
                <p className="text-xs text-[var(--ink-faint)] mt-0.5">Add your services with pricing — your AI will use this to answer customers</p>
              </div>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-white/90 transition-colors"
              >
                <Icons.Plus className="h-3.5 w-3.5" /> Add service
              </button>
            </div>

            {services.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  if (selectedTemplate && selectedTemplate.services.length > 0) {
                    setServices(
                      selectedTemplate.services.map((s) => ({
                        name: s.name,
                        description: s.description,
                        price: s.priceCents ? (s.priceCents / 100).toString() : '',
                        duration: s.durationMinutes ? s.durationMinutes.toString() : '',
                      }))
                    )
                  } else {
                    addService()
                  }
                }}
                className="w-full rounded-2xl border border-dashed border-[var(--line)] py-6 text-sm text-[var(--ink-faint)] hover:border-[var(--ink-faint)] hover:bg-white/30 transition-colors"
              >
                {selectedTemplate && selectedTemplate.services.length > 0
                  ? `Load ${selectedTemplate.label} template services`
                  : 'Click to add your first service'}
              </button>
            )}

            <div className="space-y-3">
              {services.map((svc, i) => (
                <div key={i} className="rounded-2xl border border-[var(--line)] bg-white/40 px-4 py-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={svc.name}
                        onChange={(e) => updateService(i, 'name', e.target.value)}
                        placeholder="Service name *"
                        className={inputClasses}
                      />
                      <input
                        value={svc.description}
                        onChange={(e) => updateService(i, 'description', e.target.value)}
                        placeholder="Short description"
                        className={inputClasses}
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-faint)]">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={svc.price}
                          onChange={(e) => updateService(i, 'price', e.target.value)}
                          placeholder="Price (AUD)"
                          className={cn(inputClasses, 'pl-7')}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="5"
                          step="5"
                          value={svc.duration}
                          onChange={(e) => updateService(i, 'duration', e.target.value)}
                          placeholder="Duration (mins)"
                          className={inputClasses}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--ink-faint)]">min</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="mt-1 rounded-lg p-1.5 text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.1)] hover:text-[var(--error)] transition-colors"
                    >
                      <Icons.X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQs ──────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">FAQs</h3>
                <p className="text-xs text-[var(--ink-faint)] mt-0.5">Common questions your AI should know the answers to</p>
              </div>
              <button
                type="button"
                onClick={addFaq}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-white/90 transition-colors"
              >
                <Icons.Plus className="h-3.5 w-3.5" /> Add FAQ
              </button>
            </div>

            {faqs.length === 0 && selectedTemplate && selectedTemplate.faqs.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFaqs(selectedTemplate!.faqs.map((f) => ({ question: f.question, answer: f.answer })))
                }
                className="w-full rounded-2xl border border-dashed border-[var(--line)] py-6 text-sm text-[var(--ink-faint)] hover:border-[var(--ink-faint)] hover:bg-white/30 transition-colors"
              >
                Load template FAQs for {selectedTemplate.label}
              </button>
            )}

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-2xl border border-[var(--line)] bg-white/40 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        value={faq.question}
                        onChange={(e) => updateFaq(i, 'question', e.target.value)}
                        placeholder="Question"
                        className={inputClasses}
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className={cn(inputClasses, 'resize-none')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaq(i)}
                      className="mt-1 rounded-lg p-1.5 text-[var(--ink-faint)] hover:bg-[rgba(181,79,64,0.1)] hover:text-[var(--error)] transition-colors"
                    >
                      <Icons.X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end pt-2 border-t border-[var(--surface-muted)]">
        <button
          type="submit"
          disabled={saving || !form.business_name || !selectedTemplate}
          className="px-6 py-2 bg-[var(--teal)] text-white text-sm font-medium rounded-xl hover:bg-[var(--teal-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
