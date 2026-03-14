import { PageIntro } from '@/components/dashboard/page-intro'
import { CrmView } from '@/components/dashboard/crm-view'
import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'

export default async function CrmPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const [clientsResult, leadsResult, quotesResult, invoicesResult] = await Promise.all([
    supabase
      .from('clients')
      .select('*, channel_identities(channel, identifier)')
      .eq('tenant_id', tenantId)
      .order('last_seen_at', { ascending: false })
      .limit(200),
    supabase
      .from('leads')
      .select('id, client_id, status, score, source_channel')
      .eq('tenant_id', tenantId),
    supabase
      .from('quotes')
      .select('id, client_id, status, total_cents')
      .eq('tenant_id', tenantId),
    supabase
      .from('invoices')
      .select('id, client_id, status, total_cents')
      .eq('tenant_id', tenantId),
  ])

  const clients = clientsResult.data || []
  const leads = leadsResult.data || []
  const quotes = quotesResult.data || []
  const invoices = invoicesResult.data || []

  // Build lead lookup
  const leadByClientId = new Map(leads.map((l: any) => [l.client_id, l]))

  // Build revenue per client (from paid invoices + accepted quotes)
  const revenueByClientId = new Map<string, number>()
  for (const inv of invoices) {
    if (['paid', 'sent', 'overdue'].includes((inv as any).status)) {
      const prev = revenueByClientId.get((inv as any).client_id) || 0
      revenueByClientId.set((inv as any).client_id, prev + ((inv as any).total_cents || 0))
    }
  }

  // Enrich clients
  const enrichedClients = clients.map((c: any) => ({
    ...c,
    lead: leadByClientId.get(c.id) || null,
    totalRevenueCents: revenueByClientId.get(c.id) || 0,
  }))

  // Stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const activeLeads = leads.filter(
    (l: any) => !['won', 'lost'].includes(l.status)
  ).length
  const outstandingRevenue = invoices
    .filter((inv: any) => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum: number, inv: any) => sum + (inv.total_cents || 0), 0)
  const wonDealsThisMonth = leads.filter((l: any) => l.status === 'won').length

  return (
    <div className="dashboard-stack">
      <PageIntro
        eyebrow="CRM"
        title="Your customers, unified."
        description="Clients, leads, revenue, and conversations in one place."
        aside={
          <div className="panel-muted w-full rounded-[28px] p-5 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(208,109,79,0.12)]">
                <Users className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {enrichedClients.length} client{enrichedClients.length === 1 ? '' : 's'}
                </p>
                <p className="text-xs text-[var(--ink-faint)]">Sorted by most recent activity.</p>
              </div>
            </div>
          </div>
        }
      />
      <CrmView
        clients={enrichedClients}
        stats={{
          totalClients: enrichedClients.length,
          activeLeads,
          outstandingRevenue,
          wonDealsThisMonth,
        }}
      />
    </div>
  )
}
