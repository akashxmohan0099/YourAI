import { requireTenant } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { PageIntro } from '@/components/dashboard/page-intro'
import { RosteringView } from '@/components/dashboard/rostering-view'

export default async function RosteringPage() {
  const { tenantId } = await requireTenant()
  const supabase = createAdminClient()

  const { data: members } = await supabase
    .from('team_members')
    .select('id, name, phone, email, availability')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-5">
      <PageIntro
        eyebrow="Operations"
        title="Rostering"
        description="Add team members, call to check their availability, and view the weekly roster."
      />
      <RosteringView initialMembers={members || []} />
    </div>
  )
}
