import { CallClientButton } from '@/components/dashboard/call-client-button'
import { CrmClientHub } from '@/components/dashboard/crm-client-hub'
import { CrmQuickActions } from '@/components/dashboard/crm-quick-actions'
import { requireTenant } from '@/lib/auth/guards'
import { formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CrmClientDetailPage({ params }: Props) {
  const { id } = await params
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const [
    clientResult,
    conversationsResult,
    quotesResult,
    invoicesResult,
    appointmentsResult,
    notesResult,
    tagsResult,
    leadResult,
    configResult,
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*, channel_identities(channel, identifier, created_at)')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single(),
    supabase
      .from('conversations')
      .select('id, channel, status, started_at, ended_at')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false })
      .limit(20),
    supabase
      .from('quotes')
      .select('id, quote_number, total_cents, status, valid_until, created_at')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('id, invoice_number, total_cents, status, due_date, created_at')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select('*, services(name)')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .order('starts_at', { ascending: false })
      .limit(20),
    supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_tags')
      .select('*')
      .eq('client_id', id)
      .eq('tenant_id', tenantId),
    supabase
      .from('leads')
      .select('*')
      .eq('client_id', id)
      .eq('tenant_id', tenantId)
      .single(),
    supabase
      .from('business_config')
      .select('voice_enabled')
      .eq('tenant_id', tenantId)
      .single(),
  ])

  const client = clientResult.data
  if (!client) notFound()

  const conversations = conversationsResult.data || []
  const quotes = quotesResult.data || []
  const invoices = invoicesResult.data || []
  const appointments = appointmentsResult.data || []
  const notes = notesResult.data || []
  const tags = tagsResult.data || []
  const lead = leadResult.data
  const voiceEnabled = configResult.data?.voice_enabled || false

  // Revenue summary
  const totalPaid = invoices
    .filter((inv: any) => inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + (inv.total_cents || 0), 0)
  const totalOutstanding = invoices
    .filter((inv: any) => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + (inv.total_cents || 0), 0)

  return (
    <div className="dashboard-stack">
      {/* Header */}
      <section className="panel rounded-[32px] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/crm" className="btn-secondary h-11 w-11 rounded-2xl px-0">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="space-y-3">
              <p className="kicker">Client record</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-white/55">
                  <span className="text-lg font-semibold text-[var(--ink)]">
                    {(client.name || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-[var(--ink)]">{client.name || 'Anonymous'}</h1>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    First seen {formatRelativeTime(client.first_seen_at)} • Last seen{' '}
                    {formatRelativeTime(client.last_seen_at)}
                  </p>
                </div>
              </div>
              {lead && (
                <div className="flex items-center gap-2">
                  <span className={`chip capitalize ${
                    lead.status === 'won' || lead.status === 'qualified' ? 'chip-teal' :
                    lead.status === 'new' || lead.status === 'lost' ? 'chip-accent' : ''
                  }`}>
                    Lead: {lead.status}
                  </span>
                  {lead.score != null && <span className="chip">{lead.score} score</span>}
                </div>
              )}
            </div>
          </div>

          <CallClientButton
            clientId={client.id}
            clientName={client.name || 'Anonymous'}
            clientPhone={client.phone || ''}
            voiceEnabled={voiceEnabled}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.45fr)]">
        {/* Left: Tabbed content */}
        <CrmClientHub
          client={client}
          conversations={conversations}
          quotes={quotes}
          invoices={invoices}
          appointments={appointments}
          notes={notes}
          tags={tags}
          lead={lead}
        />

        {/* Right: Sidebar */}
        <div className="dashboard-stack">
          {/* Contact card */}
          <div className="panel rounded-[32px] px-6 py-6">
            <p className="kicker">Contact</p>
            <div className="mt-5 space-y-4">
              {client.phone && (
                <div className="flex items-center gap-3 rounded-[24px] bg-white/45 px-4 py-4 text-sm text-[var(--ink-soft)]">
                  <Phone className="h-4 w-4 text-[var(--accent)]" />
                  {client.phone}
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-3 rounded-[24px] bg-white/45 px-4 py-4 text-sm text-[var(--ink-soft)]">
                  <Mail className="h-4 w-4 text-[var(--teal)]" />
                  {client.email}
                </div>
              )}
              {!client.phone && !client.email && (
                <p className="text-sm text-[var(--ink-soft)]">No contact info available.</p>
              )}
            </div>

            {/* Channel identities */}
            {(client.channel_identities || []).length > 0 && (
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-faint)]">Channels</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(client.channel_identities || []).map((identity: any, idx: number) => (
                    <span key={idx} className="chip capitalize">
                      {identity.channel.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue summary */}
            {(totalPaid > 0 || totalOutstanding > 0) && (
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-faint)]">Revenue</p>
                <div className="mt-3 space-y-2">
                  {totalPaid > 0 && (
                    <div className="flex items-center justify-between rounded-[22px] bg-white/45 px-4 py-3">
                      <span className="text-sm text-[var(--ink-soft)]">Paid</span>
                      <span className="text-sm font-semibold text-[var(--ink)] tabular-nums">
                        ${(totalPaid / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {totalOutstanding > 0 && (
                    <div className="flex items-center justify-between rounded-[22px] bg-white/45 px-4 py-3">
                      <span className="text-sm text-[var(--ink-soft)]">Outstanding</span>
                      <span className="text-sm font-semibold text-[var(--accent)] tabular-nums">
                        ${(totalOutstanding / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <CrmQuickActions
            clientId={client.id}
            clientName={client.name || 'Anonymous'}
            clientPhone={client.phone}
            clientEmail={client.email}
            voiceEnabled={voiceEnabled}
          />
        </div>
      </div>
    </div>
  )
}
