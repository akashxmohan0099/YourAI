'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { Mail, Phone, Search, Users } from 'lucide-react'
import { TabSwitcher } from './tab-switcher'
import { CrmPipeline } from './crm-pipeline'

interface ChannelIdentity {
  channel: string
  identifier?: string | null
}

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
  last_seen_at: string
  channel_identities?: ChannelIdentity[] | null
  lead?: Lead | null
  totalRevenueCents: number
}

interface CrmViewProps {
  clients: EnrichedClient[]
  stats: {
    totalClients: number
    activeLeads: number
    outstandingRevenue: number
    wonDealsThisMonth: number
  }
}

const viewTabs = [
  { key: 'table', label: 'Table' },
  { key: 'pipeline', label: 'Pipeline' },
]

const leadStatusColors: Record<string, string> = {
  new: 'chip chip-accent',
  contacted: 'chip',
  qualified: 'chip chip-teal',
  proposal: 'chip',
  won: 'chip chip-teal',
  lost: 'chip chip-accent',
}

export function CrmView({ clients, stats }: CrmViewProps) {
  const [activeView, setActiveView] = useState('table')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = clients.filter((client) => {
    const matchesSearch =
      !search ||
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.includes(search) ||
      client.email?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'no-lead' && !client.lead) ||
      client.lead?.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="dashboard-stack">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total clients', value: stats.totalClients },
          { label: 'Active leads', value: stats.activeLeads },
          { label: 'Outstanding', value: `$${(stats.outstandingRevenue / 100).toFixed(0)}` },
          { label: 'Won this month', value: stats.wonDealsThisMonth },
        ].map((s) => (
          <div key={s.label} className="panel rounded-[28px] px-5 py-5">
            <p className="text-sm text-[var(--ink-faint)]">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <TabSwitcher tabs={viewTabs} activeTab={activeView} onTabChange={setActiveView} />

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-[22px] border border-[var(--line)] bg-white/60 py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[22px] border border-[var(--line)] bg-white/60 px-4 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
        >
          <option value="all">All statuses</option>
          <option value="no-lead">No lead</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Table view */}
      {activeView === 'table' && (
        <div className="panel dashboard-table rounded-[32px]">
          {filtered.length === 0 ? (
            <div className="dashboard-empty">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(208,109,79,0.12)]">
                <Users className="h-7 w-7 text-[var(--accent)]" />
              </div>
              <p className="mt-5 text-lg font-semibold text-[var(--ink)]">No clients found</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                {search ? 'Try a different search term.' : 'Client records are created when customers contact the business.'}
              </p>
            </div>
          ) : (
            filtered.map((client) => (
              <Link
                key={client.id}
                href={`/crm/${client.id}`}
                className="dashboard-table-row flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/55 flex-shrink-0">
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      {(client.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] truncate">{client.name || 'Anonymous'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-faint)]">
                      {client.phone && (
                        <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{client.phone}</span>
                      )}
                      {client.email && (
                        <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" />{client.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <div className="flex flex-wrap gap-2">
                    {(client.channel_identities || []).slice(0, 3).map((identity, idx) => (
                      <span key={idx} className="chip capitalize text-xs">
                        {identity.channel.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  {client.lead && (
                    <span className={leadStatusColors[client.lead.status] || 'chip'}>
                      {client.lead.status}
                    </span>
                  )}

                  {client.totalRevenueCents > 0 && (
                    <span className="text-sm font-semibold text-[var(--ink)] tabular-nums">
                      ${(client.totalRevenueCents / 100).toFixed(0)}
                    </span>
                  )}

                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                    {formatRelativeTime(client.last_seen_at)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Pipeline view */}
      {activeView === 'pipeline' && <CrmPipeline clients={filtered} />}
    </div>
  )
}
