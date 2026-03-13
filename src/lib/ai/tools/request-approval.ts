import { tool } from 'ai'
import { z } from 'zod'
import { createApproval } from '@/lib/approvals/engine'
import { SupabaseClient } from '@supabase/supabase-js'

export function requestApprovalTool(supabase: SupabaseClient, tenantId: string, conversationId: string, clientId?: string) {
  return tool({
    description: 'Request owner approval for an action that requires authorization. Use this when a customer asks for something that needs the owner to approve (e.g., custom pricing, special arrangements, refunds).',
    inputSchema: z.object({
      actionType: z.string().describe('Type of action needing approval (e.g., "custom_discount", "refund", "special_booking")'),
      actionDetails: z.string().describe('JSON string of the action details'),
      contextSummary: z.string().describe('Brief human-readable summary of what needs approval and why'),
    }),
    execute: async ({ actionType, actionDetails, contextSummary }: { actionType: string; actionDetails: string; contextSummary: string }) => {
      try {
        let details: Record<string, unknown>
        try {
          details = JSON.parse(actionDetails)
        } catch {
          details = { raw: actionDetails }
        }

        const approvalId = await createApproval(supabase, {
          tenantId,
          conversationId,
          clientId,
          actionType,
          actionDetails: details,
          contextSummary,
        })

        return {
          success: true,
          approvalId,
          message: 'Approval request has been sent to the business owner. They will review it shortly.',
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to submit approval request. Please try again.',
        }
      }
    },
  })
}
