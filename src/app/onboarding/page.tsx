'use client'

import { BusinessStep } from '@/components/onboarding/business-step'
import { FeaturesStep } from '@/components/onboarding/features-step'
import { LaunchStep } from '@/components/onboarding/launch-step'
import { ReviewStep } from '@/components/onboarding/review-step'
import { TellAiStep } from '@/components/onboarding/tell-ai-step'
import type { BusinessTypeTemplate, FeatureKey } from '@/lib/onboarding/business-type-templates'
import { getTemplateById } from '@/lib/onboarding/business-type-templates'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STEPS = [
  { id: 1, name: 'Your Business', description: 'Pick your industry' },
  { id: 2, name: 'Teach AI', description: 'Chat with your assistant' },
  { id: 3, name: 'Review', description: 'Check & refine details' },
  { id: 4, name: 'Features', description: 'Choose your tools' },
  { id: 5, name: 'Launch', description: 'Go live' },
]

interface OnboardingProfile {
  tenant_id: string
  tenants?: {
    status?: string
    business_type?: string | null
  } | null
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTypeTemplate | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadTenant() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id, tenants(status, business_type)')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile) {
        router.push('/signup')
        return
      }

      const profileRow = profile as OnboardingProfile

      if (profileRow.tenants?.status === 'active') {
        router.push('/dashboard')
        return
      }

      const businessType = profileRow.tenants?.business_type
      if (businessType) {
        const template = getTemplateById(businessType)
        if (template) setSelectedTemplate(template)
      }

      setTenantId(profileRow.tenant_id)
      setLoading(false)
    }
    loadTenant()
  }, [router, supabase])

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleTemplateSelect = (template: BusinessTypeTemplate) => {
    setSelectedTemplate(template)
    setSelectedFeatures(template.defaultFeatures)
  }

  const handleComplete = async () => {
    if (!tenantId) return

    const res = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    })

    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="panel flex h-20 w-20 items-center justify-center rounded-[28px]">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--line-strong)] border-t-[var(--accent)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="panel flex flex-col gap-5 rounded-[36px] px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-[rgba(208,109,79,0.12)]">
              <Sparkles className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <p className="kicker">Setup</p>
              <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">
                Let&apos;s get your AI assistant ready.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                Pick your industry, chat with your AI, and launch in minutes.
              </p>
            </div>
          </div>
          <div className="panel-muted rounded-[28px] px-5 py-4 lg:min-w-[15rem]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-faint)]">Progress</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
        </div>

        <div className="panel rounded-[36px] px-5 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-2 grid-cols-5">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'rounded-[22px] border px-3 py-3 transition-colors',
                  currentStep === step.id
                    ? 'border-[rgba(43,114,107,0.22)] bg-[rgba(43,114,107,0.08)]'
                    : currentStep > step.id
                      ? 'border-[rgba(208,109,79,0.18)] bg-[rgba(208,109,79,0.08)]'
                      : 'border-[var(--line)] bg-white/40'
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold',
                    currentStep >= step.id
                      ? 'bg-[linear-gradient(135deg,var(--accent),var(--teal))] text-white'
                      : 'bg-white/70 text-[var(--ink-faint)]'
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--ink)]">{step.name}</p>
                <p className="mt-0.5 hidden text-xs leading-5 text-[var(--ink-faint)] sm:block">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[30px] bg-white/45 px-4 py-5 sm:px-6 sm:py-6">
            {currentStep === 1 && tenantId ? (
              <BusinessStep
                tenantId={tenantId}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
                onNext={handleNext}
              />
            ) : null}

            {/* Keep TellAiStep mounted when on step 3+ so chat state survives */}
            <div style={{ display: currentStep === 2 ? undefined : 'none' }}>
              {currentStep >= 2 && tenantId ? (
                <TellAiStep
                  tenantId={tenantId}
                  template={selectedTemplate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              ) : null}
            </div>

            {currentStep === 3 && tenantId ? (
              <ReviewStep tenantId={tenantId} onNext={handleNext} onBack={handleBack} />
            ) : null}

            {currentStep === 4 && tenantId ? (
              <FeaturesStep
                tenantId={tenantId}
                selectedFeatures={selectedFeatures}
                onFeaturesChange={setSelectedFeatures}
                onNext={handleNext}
                onBack={handleBack}
              />
            ) : null}

            {currentStep === 5 && tenantId ? (
              <LaunchStep
                tenantId={tenantId}
                features={selectedFeatures}
                onComplete={handleComplete}
                onBack={handleBack}
                onEditStep={setCurrentStep}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
