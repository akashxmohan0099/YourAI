'use client'

import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'

interface EmailMessage {
  id: string
  from?: Array<{ name?: string; email: string }>
  subject?: string
  snippet?: string
  date?: number
  unread?: boolean
}

interface EmailListProps {
  emails: EmailMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function EmailList({ emails, selectedId, onSelect }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(43,114,107,0.12)]">
          <Mail className="h-7 w-7 text-[var(--teal)]" />
        </div>
        <p className="mt-5 text-lg font-semibold text-[var(--ink)]">No emails</p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Your inbox is empty.</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
      {emails.map((email) => {
        const fromName = email.from?.[0]?.name || email.from?.[0]?.email || 'Unknown'
        const date = email.date ? new Date(email.date * 1000) : null

        return (
          <button
            key={email.id}
            onClick={() => onSelect(email.id)}
            className={cn(
              'w-full text-left px-5 py-4 border-b border-[var(--line)] transition-colors',
              selectedId === email.id
                ? 'bg-[rgba(43,114,107,0.08)]'
                : 'hover:bg-white/40',
              email.unread && 'bg-white/30'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                'text-sm truncate',
                email.unread ? 'font-semibold text-[var(--ink)]' : 'font-medium text-[var(--ink-soft)]'
              )}>
                {fromName}
              </p>
              {date && (
                <span className="text-xs text-[var(--ink-faint)] flex-shrink-0">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <p className={cn(
              'mt-1 text-sm truncate',
              email.unread ? 'font-medium text-[var(--ink)]' : 'text-[var(--ink-soft)]'
            )}>
              {email.subject || '(no subject)'}
            </p>
            <p className="mt-1 text-xs text-[var(--ink-faint)] truncate">
              {email.snippet || ''}
            </p>
            {email.unread && (
              <span className="mt-2 inline-block h-2 w-2 rounded-full bg-[var(--teal)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
