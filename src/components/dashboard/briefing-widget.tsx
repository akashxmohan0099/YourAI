import { Newspaper } from 'lucide-react'
import Link from 'next/link'

interface BriefingWidgetProps {
  latestBriefing: {
    briefing_date: string
    content?: {
      text?: string
    } | null
  } | null
}

export function BriefingWidget({ latestBriefing }: BriefingWidgetProps) {
  if (!latestBriefing) return null

  const text = latestBriefing.content?.text || ''
  const preview = text.length > 200 ? text.slice(0, 200) + '...' : text

  return (
    <div className="panel rounded-[32px] px-6 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(43,114,107,0.12)]">
          <Newspaper className="h-5 w-5 text-[var(--teal)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">Latest briefing</p>
          <p className="text-xs text-[var(--ink-faint)]">
            {new Date(latestBriefing.briefing_date).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
      {preview && (
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{preview}</p>
      )}
      <Link
        href="/your-ai"
        className="mt-4 inline-flex text-sm font-semibold text-[var(--teal)] hover:text-[var(--teal-strong)] transition-colors"
      >
        Read more
      </Link>
    </div>
  )
}
