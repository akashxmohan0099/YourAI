import { PageIntro } from '@/components/dashboard/page-intro'
import { YourAiView } from '@/components/dashboard/your-ai-view'
import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { Sparkles } from 'lucide-react'

export default async function YourAiPage() {
  const { tenantId, tenant } = await requireTenant()
  const supabase = await createClient()

  const [configResult, servicesResult, briefingsResult] = await Promise.all([
    supabase.from('business_config').select('*').eq('tenant_id', tenantId).single(),
    supabase
      .from('services')
      .select('id, name, category, price_cents, price_type, duration_minutes, is_active, sort_order')
      .eq('tenant_id', tenantId)
      .order('sort_order'),
    supabase
      .from('briefings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('briefing_date', { ascending: false })
      .limit(30),
  ])

  return (
    <div className="dashboard-stack">
      <PageIntro
        eyebrow="Your AI"
        title="Configure your AI assistant."
        description="Business profile, personality, channels, and briefings — all in one place."
        aside={
          <div className="panel-muted w-full rounded-[28px] p-5 lg:max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(208,109,79,0.12)]">
                <Sparkles className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">{tenant.name}</p>
                <p className="text-xs text-[var(--ink-faint)]">AI configuration and integrations.</p>
              </div>
            </div>
          </div>
        }
      />
      <YourAiView
        tenantId={tenantId}
        tenantSlug={tenant.slug}
        config={configResult.data}
        services={servicesResult.data || []}
        briefings={briefingsResult.data || []}
      />
    </div>
  )
}
