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
        <h2 className="text-xl font-semibold text-stone-900 mb-1">What do you need for your business?</h2>
        <p className="text-stone-500">Select the features you want. You can change these anytime.</p>
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
                'flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-stone-200 hover:border-stone-300',
                isLocked && 'cursor-default'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                isSelected ? 'bg-violet-100' : 'bg-stone-100'
              )}>
                <IconComponent className={cn('w-5 h-5', isSelected ? 'text-violet-600' : 'text-stone-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-medium text-sm', isSelected ? 'text-violet-700' : 'text-stone-700')}>
                    {feature.label}
                  </span>
                  {isLocked && (
                    <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                      Always on
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{feature.description}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                isSelected ? 'border-violet-600 bg-violet-600' : 'border-stone-300'
              )}>
                {isSelected && <Icons.Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-8 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  )
}
