import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { cancelAppointment } from '@/lib/scheduling/engine'

export function cancelAppointmentTool(
  supabase: SupabaseClient,
  tenantId: string
) {
  return tool({
    description: 'Cancel an existing appointment.',
    inputSchema: z.object({
      appointmentId: z
        .string()
        .optional()
        .describe('ID of the appointment to cancel (if known)'),
      clientName: z
        .string()
        .optional()
        .describe('Client name to find the appointment'),
      date: z
        .string()
        .optional()
        .describe('Date of the appointment (YYYY-MM-DD) to help find it'),
      reason: z.string().optional().describe('Reason for cancellation'),
    }),
    execute: async ({
      appointmentId,
      clientName,
      date,
      reason,
    }: {
      appointmentId?: string
      clientName?: string
      date?: string
      reason?: string
    }) => {
      let aptId = appointmentId

      if (!aptId && clientName) {
        let query = supabase
          .from('appointments')
          .select('id, title')
          .eq('tenant_id', tenantId)
          .neq('status', 'cancelled')
          .order('starts_at')
          .limit(1)

        if (date) {
          query = query
            .gte('starts_at', `${date}T00:00:00`)
            .lte('starts_at', `${date}T23:59:59`)
        }

        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .eq('tenant_id', tenantId)
          .ilike('name', `%${clientName}%`)
          .limit(1)

        if (clients?.[0]) {
          query = query.eq('client_id', clients[0].id)
        }

        const { data: appointments } = await query
        if (appointments?.[0]) {
          aptId = appointments[0].id
        }
      }

      if (!aptId) {
        return {
          success: false,
          message: 'Could not find the appointment. Please provide more details.',
        }
      }

      const result = await cancelAppointment(supabase, tenantId, aptId, reason)

      if (!result.success) {
        return { success: false, message: result.error }
      }

      return {
        success: true,
        message: `Appointment cancelled${reason ? `: ${reason}` : ''}.`,
      }
    },
  })
}
