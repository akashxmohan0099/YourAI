'use client'

import { Calendar, FileText, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface CrmQuickActionsProps {
  clientId: string
  clientName: string
  clientPhone?: string | null
  clientEmail?: string | null
  voiceEnabled: boolean
}

export function CrmQuickActions({
  clientId,
  clientName,
  clientPhone,
  clientEmail,
  voiceEnabled,
}: CrmQuickActionsProps) {
  return (
    <div className="panel rounded-[32px] px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--ink-faint)]">
        Quick actions
      </p>
      <div className="mt-4 space-y-2">
        {clientEmail && (
          <Link
            href={`/inbox?compose=true&to=${encodeURIComponent(clientEmail)}`}
            className="btn-secondary w-full justify-start gap-3"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Link>
        )}
        {voiceEnabled && clientPhone && (
          <button
            onClick={() => {
              // Placeholder for call client action
              window.open(`tel:${clientPhone}`, '_self')
            }}
            className="btn-secondary w-full justify-start gap-3"
          >
            <Phone className="h-4 w-4" />
            Call Client
          </button>
        )}
        <Link
          href={`/owner-chat?action=quote&client=${clientId}`}
          className="btn-secondary w-full justify-start gap-3"
        >
          <FileText className="h-4 w-4" />
          Create Quote
        </Link>
        <Link
          href={`/owner-chat?action=book&client=${clientId}`}
          className="btn-secondary w-full justify-start gap-3"
        >
          <Calendar className="h-4 w-4" />
          Book Appointment
        </Link>
      </div>
    </div>
  )
}
