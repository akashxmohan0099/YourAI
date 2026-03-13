'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Rocket } from 'lucide-react'
import type { BusinessTypeTemplate, FeatureKey } from '@/lib/onboarding/business-type-templates'
import { ALL_FEATURES } from '@/lib/onboarding/business-type-templates'

interface SummaryStepProps {
  tenantId: string
  template: BusinessTypeTemplate | null
  features: FeatureKey[]
  onComplete: () => Promise<void>
  onBack: () => void
  onEditStep: (step: number) => void
}

export function SummaryStep({ tenantId, template, features, onComplete, onBack, onEditStep }: SummaryStepProps) {
  const [config, setConfig] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [configResult, servicesResult] = await Promise.all([
        supabase.from('business_config').select('*').eq('tenant_id', tenantId).single(),
        supabase.from('services').select('*').eq('tenant_id', tenantId).order('sort_order'),
      ])
      setConfig(configResult.data)
      setServices(servicesResult.data || [])
      setLoading(false)
    }
    load()
  }, [tenantId, supabase])

  const handleLaunch = async () => {
    setLaunching(true)
    try {
      await onComplete()
    } catch {
      setLaunching(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" /></div>
  }

  const enabledFeatures = ALL_FEATURES.filter((f) => features.includes(f.key))
  const hours = config?.hours || {}
  const faqs = config?.faqs || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900 mb-1">Everything looks good?</h2>
        <p className="text-stone-500">Review your setup before launching your AI assistant</p>
      </div>

      {/* Business Info */}
      <div className="border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Business</h3>
          <button onClick={() => onEditStep(1)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-stone-500">Name:</span> <span className="text-stone-700">{config?.business_name}</span></div>
          <div><span className="text-stone-500">Type:</span> <span className="text-stone-700">{template?.label || 'Custom'}</span></div>
          {config?.phone && <div><span className="text-stone-500">Phone:</span> <span className="text-stone-700">{config.phone}</span></div>}
          {config?.email && <div><span className="text-stone-500">Email:</span> <span className="text-stone-700">{config.email}</span></div>}
        </div>
      </div>

      {/* Features */}
      <div className="border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Features ({enabledFeatures.length})</h3>
          <button onClick={() => onEditStep(2)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {enabledFeatures.map((f) => (
            <span key={f.key} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Services ({services.length})</h3>
          <button onClick={() => onEditStep(3)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="space-y-1">
          {services.slice(0, 10).map((s: any) => (
            <div key={s.id} className="flex justify-between text-sm">
              <span className="text-stone-700">{s.name}</span>
              <span className="text-stone-400">
                {s.price_cents ? `$${(s.price_cents / 100).toFixed(0)}` : 'Quote'}
                {s.price_type === 'starting_at' && '+'}
                {s.price_type === 'hourly' && '/hr'}
              </span>
            </div>
          ))}
          {services.length > 10 && <div className="text-xs text-stone-400">+{services.length - 10} more services</div>}
        </div>
      </div>

      {/* Hours */}
      <div className="border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-stone-900">Hours</h3>
          <button onClick={() => onEditStep(3)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-sm">
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day) => {
            const h = hours[day]
            return (
              <div key={day}>
                <span className="text-stone-500 capitalize">{day.slice(0,3)}: </span>
                <span className="text-stone-700">{h ? `${h.open}-${h.close}` : 'Closed'}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-900">FAQs ({faqs.length})</h3>
            <button onClick={() => onEditStep(3)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>
          <div className="space-y-2">
            {faqs.slice(0, 5).map((f: any, i: number) => (
              <div key={i}>
                <div className="text-sm font-medium text-stone-700">{f.question}</div>
                <div className="text-xs text-stone-500">{f.answer}</div>
              </div>
            ))}
            {faqs.length > 5 && <div className="text-xs text-stone-400">+{faqs.length - 5} more FAQs</div>}
          </div>
        </div>
      )}

      {/* Tone */}
      <div className="border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-stone-900">AI Personality</h3>
          <button onClick={() => onEditStep(3)} className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <span className="text-sm text-stone-700 capitalize">{config?.tone || 'Friendly'}</span>
        {config?.custom_instructions && (
          <p className="text-xs text-stone-500 mt-1">Rules: {config.custom_instructions.slice(0, 150)}</p>
        )}
      </div>

      {/* Launch */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleLaunch}
          disabled={launching}
          className="px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          {launching ? 'Launching...' : 'Launch Your AI'}
        </button>
      </div>
    </div>
  )
}
