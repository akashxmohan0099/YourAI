'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Pencil, Rocket } from 'lucide-react'
import type { FeatureKey } from '@/lib/onboarding/business-type-templates'
import { ALL_FEATURES } from '@/lib/onboarding/business-type-templates'
import { cn } from '@/lib/utils'

interface LaunchStepProps {
  tenantId: string
  features: FeatureKey[]
  onComplete: () => Promise<void>
  onBack: () => void
  onEditStep: (step: number) => void
}

export function LaunchStep({
  tenantId,
  features,
  onComplete,
  onBack,
  onEditStep,
}: LaunchStepProps) {
  const [config, setConfig] = useState<any>(null)
  const [serviceCount, setServiceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [configResult, servicesResult] = await Promise.all([
        supabase
          .from('business_config')
          .select('business_name, phone, email, hours, faqs, tone')
          .eq('tenant_id', tenantId)
          .single(),
        supabase.from('services').select('id').eq('tenant_id', tenantId),
      ])
      setConfig(configResult.data)
      setServiceCount(servicesResult.data?.length || 0)
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
    return (
      <div className="flex justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--ink)]" />
      </div>
    )
  }

  const enabledFeatures = ALL_FEATURES.filter((f) => features.includes(f.key))
  const faqCount = (config?.faqs as any[])?.length || 0
  const hoursSet = config?.hours
    ? Object.values(config.hours).some((h: any) => h !== null)
    : false

  const readiness = [
    { label: 'Business profile', done: !!config?.business_name, edit: 3 },
    { label: `${serviceCount} services`, done: serviceCount > 0, edit: 3 },
    { label: 'Business hours', done: hoursSet, edit: 3 },
    { label: `${faqCount} FAQs`, done: faqCount > 0, edit: 3 },
    { label: `${enabledFeatures.length} features`, done: enabledFeatures.length > 0, edit: 4 },
    { label: `Tone: ${config?.tone || 'friendly'}`, done: true, edit: 2 },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[rgba(43,114,107,0.1)]">
          <Rocket className="h-7 w-7 text-[var(--teal)]" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--ink)]">Ready to launch?</h2>
        <p className="mx-auto max-w-md text-sm text-[var(--ink-faint)]">
          Your AI assistant for{' '}
          <strong className="text-[var(--ink)]">{config?.business_name}</strong> is configured and
          ready to start handling customers.
        </p>
      </div>

      <div className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)]">
        {readiness.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  item.done ? 'bg-[rgba(43,114,107,0.15)]' : 'bg-[var(--surface-muted)]'
                )}
              >
                {item.done && <Check className="h-3.5 w-3.5 text-[var(--teal)]" />}
              </div>
              <span className="text-sm text-[var(--ink)]">{item.label}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(item.edit)}
              className="flex items-center gap-1 text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {enabledFeatures.map((f) => (
          <span
            key={f.key}
            className="rounded bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--ink-soft)]"
          >
            {f.label}
          </span>
        ))}
      </div>

      <div className="flex justify-between border-t border-[var(--line)] pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-5 py-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-ghost)] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleLaunch}
          disabled={launching}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--teal)] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-strong)] disabled:opacity-50 transition-colors"
        >
          <Rocket className="h-4 w-4" />
          {launching ? 'Launching...' : 'Launch your AI'}
        </button>
      </div>
    </div>
  )
}
