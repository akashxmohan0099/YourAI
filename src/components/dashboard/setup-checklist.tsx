import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SetupChecklistProps {
  config: {
    business_name?: string | null
    description?: string | null
    hours?: Record<string, unknown> | null
    conversation_style?: string | null
    example_phrases?: string | null
    nylas_grant_id?: string | null
    voice_enabled?: boolean | null
    vapi_assistant_id?: string | null
    sms_enabled?: boolean | null
    twilio_phone_number?: string | null
  } | null
  servicesCount: number
}

interface Step {
  label: string
  done: boolean
  link: string
}

export function SetupChecklist({ config, servicesCount }: SetupChecklistProps) {
  const steps: Step[] = [
    {
      label: 'Set up your business profile',
      done: !!(config?.business_name && config?.description),
      link: '/your-ai',
    },
    {
      label: 'Configure business hours',
      done: !!(config?.hours && Object.keys(config.hours).length > 0),
      link: '/your-ai',
    },
    {
      label: 'Add your services',
      done: servicesCount > 0,
      link: '/your-ai',
    },
    {
      label: 'Set AI personality',
      done: !!(config?.conversation_style || config?.example_phrases),
      link: '/your-ai',
    },
    {
      label: 'Connect email',
      done: !!config?.nylas_grant_id,
      link: '/your-ai',
    },
    {
      label: 'Enable voice calls',
      done: !!(config?.voice_enabled && config?.vapi_assistant_id),
      link: '/your-ai',
    },
    {
      label: 'Enable SMS',
      done: !!(config?.sms_enabled && config?.twilio_phone_number),
      link: '/your-ai',
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone = completedCount === steps.length
  if (allDone) return null

  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="panel rounded-[32px] px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="kicker">Getting started</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
            {completedCount} of {steps.length} complete
          </h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-[var(--teal)]">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--teal))] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-5 space-y-2">
        {steps.map((step) => (
          <div
            key={step.label}
            className="flex items-center gap-3 rounded-[22px] bg-white/40 px-4 py-3"
          >
            {step.done ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-[var(--teal)]" />
            ) : (
              <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-[var(--line)]" />
            )}
            <span
              className={`flex-1 text-sm ${
                step.done
                  ? 'text-[var(--ink-faint)] line-through'
                  : 'font-medium text-[var(--ink)]'
              }`}
            >
              {step.label}
            </span>
            {!step.done && (
              <Link
                href={step.link}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--teal)] hover:text-[var(--teal-strong)] transition-colors"
              >
                Set up <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
