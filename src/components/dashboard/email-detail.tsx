'use client'

import { useState } from 'react'
import { Mail, Reply } from 'lucide-react'
import { EmailCompose } from './email-compose'

interface EmailDetailProps {
  email: {
    id: string
    from?: Array<{ name?: string; email: string }>
    to?: Array<{ name?: string; email: string }>
    subject?: string
    body?: string
    date?: number
  } | null
  loading: boolean
}

export function EmailDetail({ email, loading }: EmailDetailProps) {
  const [replying, setReplying] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--teal)]" />
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(36,28,23,0.08)]">
          <Mail className="h-7 w-7 text-[var(--ink-faint)]" />
        </div>
        <p className="mt-5 text-lg font-semibold text-[var(--ink)]">Select an email</p>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Choose a message from the left to read it.</p>
      </div>
    )
  }

  const fromName = email.from?.[0]?.name || email.from?.[0]?.email || 'Unknown'
  const fromEmail = email.from?.[0]?.email || ''
  const toNames = (email.to || []).map((t) => t.name || t.email).join(', ')
  const date = email.date ? new Date(email.date * 1000) : null

  return (
    <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: '70vh' }}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--ink)]">{email.subject || '(no subject)'}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div>
              <span className="font-semibold text-[var(--ink)]">{fromName}</span>
              {fromName !== fromEmail && (
                <span className="text-[var(--ink-faint)]"> &lt;{fromEmail}&gt;</span>
              )}
            </div>
            {date && (
              <span className="text-[var(--ink-faint)]">
                {date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          {toNames && (
            <p className="mt-1 text-xs text-[var(--ink-faint)]">To: {toNames}</p>
          )}
        </div>

        <div className="border-t border-[var(--line)] pt-4">
          {email.body ? (
            <div
              className="prose prose-sm max-w-none text-[var(--ink-soft)]"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          ) : (
            <p className="text-sm text-[var(--ink-faint)]">No message body.</p>
          )}
        </div>

        {!replying && (
          <button
            onClick={() => setReplying(true)}
            className="btn-secondary mt-4"
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>
        )}

        {replying && (
          <EmailCompose
            replyTo={{
              messageId: email.id,
              to: fromEmail,
              subject: `Re: ${email.subject || ''}`,
            }}
            onCancel={() => setReplying(false)}
            onSent={() => setReplying(false)}
          />
        )}
      </div>
    </div>
  )
}
