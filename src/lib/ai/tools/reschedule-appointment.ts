import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { rescheduleAppointment } from '@/lib/scheduling/engine'

export function rescheduleAppointmentTool(
  supabase: SupabaseClient,
  tenantId: string
) {
  return tool({
    description:
      'Reschedule an existing appointment to a new date/time. Checks for conflicts.',
    inputSchema: z.object({
      appointmentId: z
        .string()
        .optional()
        .describe('ID of the appointment to reschedule (if known)'),
      clientName: z
        .string()
        .optional()
        .describe('Client name to find the appointment'),
      currentDate: z
        .string()
        .optional()
        .describe('Current date of the appointment (YYYY-MM-DD) to help find it'),
      newDate: z.string().describe('New date in YYYY-MM-DD format'),
      newTime: z.string().describe('New start time in HH:MM format (24-hour)'),
    }),
    execute: async ({
      appointmentId,
      clientName,
      currentDate,
      newDate,
      newTime,
    }: {
      appointmentId?: string
      clientName?: string
      currentDate?: string
      newDate: string
      newTime: string
    }) => {
      let aptId = appointmentId

      // If no ID, try to find by client name and date
      if (!aptId && clientName) {
        let query = supabase
          .from('appointments')
          .select('id, title, starts_at, ends_at, services(duration_minutes)')
          .eq('tenant_id', tenantId)
          .neq('status', 'cancelled')
          .order('starts_at')
          .limit(1)

        if (currentDate) {
          const dayStart = `${currentDate}T00:00:00`
          const dayEnd = `${currentDate}T23:59:59`
          query = query.gte('starts_at', dayStart).lte('starts_at', dayEnd)
        }

        // Search by client
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

      // Get original to calculate duration
      const { data: original } = await supabase
        .from('appointments')
        .select('starts_at, ends_at, title')
        .eq('id', aptId)
        .single()

      if (!original) {
        return { success: false, message: 'Appointment not found.' }
      }

      const originalDuration =
        new Date(original.ends_at).getTime() -
        new Date(original.starts_at).getTime()
      const newStartsAt = new Date(`${newDate}T${newTime}:00`)
      const newEndsAt = new Date(newStartsAt.getTime() + originalDuration)

      if (isNaN(newStartsAt.getTime())) {
        return { success: false, message: 'Invalid date or time format.' }
      }

      const result = await rescheduleAppointment(
        supabase,
        tenantId,
        aptId,
        newStartsAt,
        newEndsAt
      )

      if (!result.success) {
        return { success: false, message: result.error }
      }

      return {
        success: true,
        message: `Rescheduled "${original.title}" to ${newDate} at ${newTime}`,
      }
    },
  })
}
