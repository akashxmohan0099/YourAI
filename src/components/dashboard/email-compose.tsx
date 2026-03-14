'use client'

import { useState } from 'react'
import { Send, X } from 'lucide-react'

interface EmailComposeProps {
  replyTo?: {
    messageId: string
    to: string
    subject: string
  }
  onCancel: () => void
  onSent: () => void
}

export function EmailCompose({ replyTo, onCancel, onSent }: EmailComposeProps) {
  const [to, setTo] = useState(replyTo?.to || '')
  const [subject, setSubject] = useState(replyTo?.subject || '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Please fill in all fields')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: body.trim(),
          replyToMessageId: replyTo?.messageId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send email')
        setSending(false)
        return
      }

      onSent()
    } catch {
      setError('Network error — please try again')
      setSending(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-[var(--line)] rounded-xl text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent bg-white/60'

  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-white/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--ink)]">
          {replyTo ? 'Reply' : 'New email'}
        </p>
        <button onClick={onCancel} className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 rounded-xl text-sm bg-[rgba(181,79,64,0.12)] text-[var(--error)] border border-[rgba(181,79,64,0.2)]">
          {error}
        </div>
      )}

      <div>
        <label className="field-label">To</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="email@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="field-label">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className={inputClass}
        />
      </div>

      <div>
        <label className="field-label">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Write your message..."
          className={inputClass}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-primary"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
