'use client'

import { useState } from 'react'
import { TabSwitcher } from './tab-switcher'
import { ClientDetailEnhanced } from './client-detail-enhanced'
import { CrmClientFinancials } from './crm-client-financials'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare, Calendar } from 'lucide-react'
import Link from 'next/link'

interface CrmClientHubProps {
  client: any
  conversations: any[]
  quotes: any[]
  invoices: any[]
  appointments: any[]
  notes: any[]
  tags: any[]
  lead: any | null
}

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'financials', label: 'Quotes & Invoices' },
  { key: 'appointments', label: 'Appointments' },
]

export function CrmClientHub({
  client,
  conversations,
  quotes,
  invoices,
  appointments,
  notes,
  tags,
  lead,
}: CrmClientHubProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="dashboard-stack">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <ClientDetailEnhanced
          client={client}
          notes={notes}
          tags={tags}
          appointments={appointments}
        />
      )}

      {activeTab === 'conversations' && (
        <div className="panel dashboard-table rounded-[32px]">
          <div className="border-b border-[var(--line)] px-6 py-5">
            <p className="kicker">Conversation history</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ink)]">
              {conversations.length} interaction{conversations.length === 1 ? '' : 's'}
            </h2>
          </div>
          {conversations.length === 0 ? (
            <div className="dashboard-empty">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-[rgba(208,109,79,0.12)]">
                <MessageSquare className="h-7 w-7 text-[var(--accent)]" />
              </div>
              <p className="mt-5 text-lg font-semibold text-[var(--ink)]">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation: any) => (
              <Link
                key={conversation.id}
                href={`/conversations/${conversation.id}`}
                className="dashboard-table-row flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55">
                  <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold capitalize text-[var(--ink)]">
                    {conversation.channel.replace('_', ' ')}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ink-faint)]">{formatDateTime(conversation.started_at)}</p>
                </div>
                <span
                  className={`chip capitalize ${
                    conversation.status === 'active'
                      ? 'chip-teal'
                      : conversation.status === 'escalated'
                      ? 'chip-accent'
                      : ''
                  }`}
                >
                  {conversation.status}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="panel rounded-[32px] px-6 py-6">
          <CrmClientFinancials quotes={quotes} invoices={invoices} />
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="panel rounded-[32px] px-6 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(201,146,64,0.12)]">
              <Calendar className="h-4 w-4 text-[var(--gold)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--ink)]">Appointments</h3>
          </div>
          {appointments.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment: any) => (
                <div key={appointment.id} className="flex flex-col gap-3 rounded-[24px] bg-white/45 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-[94px]">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                      {new Date(appointment.starts_at).toLocaleDateString()}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                      {new Date(appointment.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--ink)]">{appointment.title}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{appointment.services?.name}</p>
                  </div>
                  <span className={`chip capitalize ${appointment.status === 'confirmed' ? 'chip-teal' : appointment.status === 'cancelled' ? 'chip-accent' : ''}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
