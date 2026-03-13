import { inngest } from '../client'
import { createAdminClient } from '@/lib/supabase/admin'

export const handleApprovalCreated = inngest.createFunction(
  { id: 'handle-approval-created' },
  { event: 'approval/created' },
  async ({ event, step }) => {
    const { approvalId, tenantId, expiresAt } = event.data

    // Wait until expiry time
    const expiresDate = new Date(expiresAt)
    const now = new Date()
    const delayMs = expiresDate.getTime() - now.getTime()

    if (delayMs > 0) {
      await step.sleep('wait-for-expiry', delayMs)
    }

    // Check if still pending
    const supabase = createAdminClient()
    const { data: approval } = await supabase
      .from('approvals')
      .select('status')
      .eq('id', approvalId)
      .single()

    if (approval?.status === 'pending') {
      await supabase
        .from('approvals')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', approvalId)

      return { expired: true, approvalId }
    }

    return { expired: false, approvalId, currentStatus: approval?.status }
  }
)

export const handleApprovalResolved = inngest.createFunction(
  { id: 'handle-approval-resolved' },
  { event: 'approval/resolved' },
  async ({ event }) => {
    const { approvalId, tenantId, conversationId, decision, actionType } = event.data

    const supabase = createAdminClient()

    // Log the resolution
    await supabase.from('ai_audit_log').insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      event_type: 'permission_check',
      tool_name: 'request-approval',
      tool_input: { approvalId, actionType },
      permission_result: decision,
    })

    return { processed: true, approvalId, decision }
  }
)
