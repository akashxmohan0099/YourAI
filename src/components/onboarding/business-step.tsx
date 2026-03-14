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

interface BusinessStepProps {
  tenantId: string
  selectedTemplate: BusinessTypeTemplate | null
  onTemplateSelect: (template: BusinessTypeTemplate) => void
  onNext: () => void
}

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

interface ScrapeResult {
  business_name?: string
  phone?: string
  email?: string
  description?: string
  address?: { street?: string; city?: string; state?: string; postcode?: string }
  services?: Array<{ name: string; description?: string; price?: string; duration?: string }>
  hours?: Record<string, { open: string; close: string } | null>
  faqs?: Array<{ question: string; answer: string }>
  industry?: string
  tone?: string
}

export function BusinessStep({ tenantId, selectedTemplate, onTemplateSelect, onNext }: BusinessStepProps) {
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('business_config')
        .select('website')
        .eq('tenant_id', tenantId)
        .single()
      if (data?.website) setScrapeUrl(data.website)
    }
    load()
  }, [tenantId, supabase])

  const handleScrape = async () => {
    if (!scrapeUrl) return
    let url = scrapeUrl.trim()
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setScraping(true)
    setScrapeError(null)
    setScrapeResult(null)

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

      setScrapeResult(json.data)

      if (json.data.industry && !selectedTemplate) {
        const matched = matchIndustryToTemplate(json.data.industry)
        if (matched) onTemplateSelect(matched)
      }
    } catch {
      setScrapeError('Network error — please try again')
    } finally {
      setScraping(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return
    setSaving(true)

    // Save template to tenants
    await supabase
      .from('tenants')
      .update({ business_type: selectedTemplate.id })
      .eq('id', tenantId)

    // Build business_config updates
    const configUpdates: Record<string, any> = {
      industry: selectedTemplate.industry,
      website: scrapeUrl || null,
    }

    // Merge scrape contact data
    if (scrapeResult) {
      if (scrapeResult.phone) configUpdates.phone = scrapeResult.phone
      if (scrapeResult.email) configUpdates.email = scrapeResult.email
      if (scrapeResult.description) configUpdates.description = scrapeResult.description
      if (scrapeResult.address) configUpdates.address = scrapeResult.address
    }

    // Hours: scrape > template
    configUpdates.hours =
      scrapeResult?.hours && Object.keys(scrapeResult.hours).length > 0
        ? scrapeResult.hours
        : selectedTemplate.defaultHours

    // FAQs: scrape > template
    configUpdates.faqs =
      scrapeResult?.faqs && scrapeResult.faqs.length > 0
        ? scrapeResult.faqs
        : selectedTemplate.faqs

    configUpdates.tone = scrapeResult?.tone || selectedTemplate.suggestedTone

    await supabase.from('business_config').update(configUpdates).eq('tenant_id', tenantId)

    // Services: scrape > template — only insert if none exist yet
    const { data: existingSvc } = await supabase
      .from('services')
      .select('id')
      .eq('tenant_id', tenantId)
      .limit(1)

    if (!existingSvc || existingSvc.length === 0) {
      const serviceRows =
        scrapeResult?.services && scrapeResult.services.length > 0
          ? scrapeResult.services.map((s, i) => ({
              tenant_id: tenantId,
              name: s.name,
              description: s.description || '',
              category: selectedTemplate.industry,
              price_cents: s.price
                ? Math.round(parseFloat(s.price.replace(/[^0-9.]/g, '')) * 100) || null
                : null,
              price_type: 'fixed' as const,
              duration_minutes: s.duration
                ? parseInt(s.duration.replace(/[^0-9]/g, '')) || null
                : null,
              is_active: true,
              sort_order: i,
            }))
          : selectedTemplate.services.map((s, i) => ({
              tenant_id: tenantId,
              name: s.name,
              description: s.description,
              category: s.category,
              price_cents: s.priceCents,
              price_type: s.priceType,
              duration_minutes: s.durationMinutes,
              is_active: true,
              sort_order: i,
            }))

      if (serviceRows.length > 0) {
        await supabase.from('services').insert(serviceRows)
      }
    }

    setSaving(false)
    onNext()
  }

  const scrapeInfo = scrapeResult
    ? [
        scrapeResult.services?.length ? `${scrapeResult.services.length} services` : null,
        scrapeResult.hours ? 'business hours' : null,
        scrapeResult.faqs?.length ? `${scrapeResult.faqs.length} FAQs` : null,
        scrapeResult.phone || scrapeResult.email ? 'contact details' : null,
      ].filter(Boolean)
    : []

  const inputClasses =
    'w-full px-3 py-2 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-shadow'

  return (
    <div className="space-y-8">
      {/* Website import */}
      <div className="rounded-[24px] border border-dashed border-[rgba(43,114,107,0.3)] bg-[rgba(43,114,107,0.04)] px-5 py-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(43,114,107,0.12)]">
            <Icons.Globe className="h-4 w-4 text-[var(--teal)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              Have a website? Import your details
            </p>
            <p className="text-xs text-[var(--ink-faint)]">
              We&apos;ll extract services, hours, and contact info automatically
            </p>
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
            className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
        {scrapeResult && scrapeInfo.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--success)]">
            <Icons.Check className="h-3.5 w-3.5" /> Found {scrapeInfo.join(', ')}
          </p>
        )}
      </div>

      {/* Business type selector */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">What type of business do you run?</h2>
        <p className="mb-5 mt-1 text-sm text-[var(--ink-faint)]">
          This pre-loads services, hours, and FAQs — you can customise everything later.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BUSINESS_TYPE_TEMPLATES.map((template) => {
            const IconComponent = getIcon(template.icon)
            const isSelected = selectedTemplate?.id === template.id
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onTemplateSelect(template)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors',
                  isSelected
                    ? 'border-[var(--ink)] bg-[var(--surface-muted)]'
                    : 'border-[var(--line)] hover:border-[var(--ink-faint)] hover:bg-[var(--surface-ghost)]'
                )}
              >
                <IconComponent
                  className={cn(
                    'h-5 w-5',
                    isSelected ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'
                  )}
                />
                <span className="text-sm font-medium text-[var(--ink)]">{template.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-[var(--surface-muted)] pt-2">
        <button
          onClick={handleSubmit}
          disabled={saving || !selectedTemplate}
          className="px-6 py-2 bg-[var(--teal)] text-white text-sm font-medium rounded-xl hover:bg-[var(--teal-strong)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {saving ? 'Setting up...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
