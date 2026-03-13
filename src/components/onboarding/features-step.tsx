'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ALL_FEATURES, type FeatureKey } from '@/lib/onboarding/business-type-templates'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'

interface FeaturesStepProps {
  tenantId: string
  selectedFeatures: FeatureKey[]
  onFeaturesChange: (features: FeatureKey[]) => void
  onNext: () => void
  onBack: () => void
}

function getIcon(iconName: string) {
  const map: Record<string, any> = {
    Phone: Icons.Phone,
    Calendar: Icons.Calendar,
    FileText: Icons.FileText,
    CreditCard: Icons.CreditCard,
    MessageSquare: Icons.MessageSquare,
    Mail: Icons.Mail,
    Users: Icons.Users,
    Bell: Icons.Bell,
    Star: Icons.Star,
    Sunrise: Icons.Sunrise,
  }
  return map[iconName] || Icons.Circle
}

export function FeaturesStep({ tenantId, selectedFeatures, onFeaturesChange, onNext, onBack }: FeaturesStepProps) {
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const toggleFeature = (key: FeatureKey) => {
    if (key === 'ai_receptionist') return // Always on
    if (selectedFeatures.includes(key)) {
      onFeaturesChange(selectedFeatures.filter((f) => f !== key))
    } else {
      onFeaturesChange([...selectedFeatures, key])
    }
  }

  const handleSubmit = async () => {
    setSaving(true)

    // Ensure ai_receptionist is always included
    const features = selectedFeatures.includes('ai_receptionist')
      ? selectedFeatures
      : ['ai_receptionist' as FeatureKey, ...selectedFeatures]

    await supabase
      .from('business_config')
      .update({ enabled_features: features })
      .eq('tenant_id', tenantId)

    setSaving(false)
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">What do you need for your business?</h2>
        <p className="text-sm text-zinc-500 mt-1">Select the features you want. You can change these anytime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_FEATURES.map((feature) => {
          const IconComponent = getIcon(feature.icon)
          const isSelected = selectedFeatures.includes(feature.key) || feature.key === 'ai_receptionist'
          const isLocked = feature.key === 'ai_receptionist'

          return (
            <button
              key={feature.key}
              type="button"
              onClick={() => toggleFeature(feature.key)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border text-left transition-colors',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                isLocked && 'cursor-default opacity-90'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                isSelected ? 'bg-indigo-100' : 'bg-zinc-100'
              )}>
                <IconComponent className={cn('w-4 h-4', isSelected ? 'text-indigo-600' : 'text-zinc-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-medium text-sm', isSelected ? 'text-zinc-900' : 'text-zinc-700')}>
                    {feature.label}
                  </span>
                  {isLocked && (
                    <span className="text-[11px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                      Always on
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{feature.description}</p>
              </div>
              {!isLocked && (
                <div className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-zinc-300'
                )}>
                  {isSelected && <Icons.Check className="w-3 h-3 text-white" />}
                </div>
              )}
              {isLocked && (
                <div className="w-4 h-4 rounded border border-indigo-300 bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icons.Check className="w-3 h-3 text-indigo-600" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex justify-between pt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
