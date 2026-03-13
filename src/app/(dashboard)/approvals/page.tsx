import { requireTenant } from '@/lib/auth/guards'
import { createClient } from '@/lib/supabase/server'
import { ApprovalQueue } from '@/components/dashboard/approval-queue'

export default async function ApprovalsPage() {
  const { tenantId } = await requireTenant()
  const supabase = await createClient()

  const { data: approvals } = await supabase
    .from('approvals')
    .select('*, clients(name, phone), conversations(channel)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
      <ApprovalQueue approvals={approvals || []} tenantId={tenantId} />
    </div>
  )
}
