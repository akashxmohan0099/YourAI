'use client'

import { useState, useCallback } from 'react'
import { EmailList } from './email-list'
import { EmailDetail } from './email-detail'
import { EmailCompose } from './email-compose'
import { Pencil, RefreshCw } from 'lucide-react'

interface EmailMessage {
  id: string
  from?: Array<{ name?: string; email: string }>
  to?: Array<{ name?: string; email: string }>
  subject?: string
  snippet?: string
  body?: string
  date?: number
  unread?: boolean
}

interface InboxViewProps {
  initialEmails: EmailMessage[]
}

export function InboxView({ initialEmails }: InboxViewProps) {
  const [emails, setEmails] = useState<EmailMessage[]>(initialEmails)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [composing, setComposing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleSelect = useCallback(async (id: string) => {
    setSelectedId(id)
    setLoadingDetail(true)
    setComposing(false)

    try {
      const res = await fetch(`/api/email/${id}`)
      if (res.ok) {
        const result = await res.json()
        setSelectedEmail(result.data || result)
      }
    } catch {
      // Failed to load detail
    }

    setLoadingDetail(false)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/email/list?limit=25')
      if (res.ok) {
        const result = await res.json()
        setEmails(result.data || [])
      }
    } catch {
      // Failed to refresh
    }
    setRefreshing(false)
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={() => { setComposing(true); setSelectedId(null); setSelectedEmail(null) }}
          className="btn-primary"
        >
          <Pencil className="h-4 w-4" />
          Compose
        </button>
      </div>

      <div className="panel rounded-[32px] overflow-hidden" style={{ minHeight: '75vh' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
          {/* Left pane: Email list */}
          <div className="border-r border-[var(--line)]">
            <EmailList
              emails={emails}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          {/* Right pane: Detail or Compose */}
          <div>
            {composing ? (
              <div className="px-6 py-6">
                <EmailCompose
                  onCancel={() => setComposing(false)}
                  onSent={() => {
                    setComposing(false)
                    handleRefresh()
                  }}
                />
              </div>
            ) : (
              <EmailDetail email={selectedEmail} loading={loadingDetail} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
