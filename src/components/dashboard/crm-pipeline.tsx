'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileCheck,
  MessageCircle,
  Sparkles,
  Trophy,
  UserPlus,
  XCircle,
} from 'lucide-react'
import type { ElementType } from 'react'

interface Lead {
  id: string
  client_id: string
  status: string
  score?: number | null
  source_channel?: string | null
}

interface EnrichedClient {
  id: string
  name?: string | null
  phone?: string | null
  email?: string | null
  lead?: Lead | null
}

interface CrmPipelineProps {
  clients: EnrichedClient[]
}

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

const statusIcons: Record<string, ElementType> = {
  new: Sparkles,
  contacted: MessageCircle,
  qualified: UserPlus,
  proposal: FileCheck,
  won: Trophy,
  lost: XCircle,
}

const statusColors: Record<string, string> = {
  new: 'border-[var(--accent)]',
  contacted: 'border-[var(--ink-faint)]',
  qualified: 'border-[var(--teal)]',
  proposal: 'border-[var(--ink-faint)]',
  won: 'border-[var(--teal)]',
  lost: 'border-[var(--accent)]',
}

export function CrmPipeline({ clients }: CrmPipelineProps) {
  const leadsOnly = clients.filter((c) => c.lead)

  return (
    <div className="grid gap-4 lg:grid-cols-6">
      {STATUSES.map((status) => {
        const Icon = statusIcons[status] || Sparkles
        const columnClients = leadsOnly.filter((c) => c.lead?.status === status)

        return (
          <div key={status} className="space-y-3">
            <div className={`rounded-[22px] border-t-2 ${statusColors[status]} bg-white/40 px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    {status}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[var(--ink-faint)]">
                  {columnClients.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {columnClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/crm/${client.id}`}
                  className="block rounded-[22px] border border-[var(--line)] bg-white/50 px-4 py-3 transition-colors hover:bg-white/70"
                >
                  <p className="text-sm font-semibold text-[var(--ink)] truncate">
                    {client.name || 'Anonymous'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {client.lead?.score != null && (
                      <span className="chip text-xs">{client.lead.score} score</span>
                    )}
                    {client.lead?.source_channel && (
                      <span className="text-xs text-[var(--ink-faint)] capitalize">
                        {client.lead.source_channel.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {columnClients.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-[var(--line)] px-4 py-6 text-center">
                  <p className="text-xs text-[var(--ink-faint)]">No leads</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
