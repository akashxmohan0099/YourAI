import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { getSchedule } from '@/lib/scheduling/engine'

export function getScheduleTool(supabase: SupabaseClient, tenantId: string) {
  return tool({
    description:
      'Get the schedule/appointments for a given time range. Use to show today\'s schedule, tomorrow\'s appointments, or this week\'s bookings.',
    inputSchema: z.object({
      range: z
        .enum(['today', 'tomorrow', 'this_week', 'next_week', 'custom'])
        .describe('Time range to view'),
      customStartDate: z
        .string()
        .optional()
        .describe('Start date for custom range (YYYY-MM-DD)'),
      customEndDate: z
        .string()
        .optional()
        .describe('End date for custom range (YYYY-MM-DD)'),
    }),
    execute: async ({
      range,
      customStartDate,
      customEndDate,
    }: {
      range: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'custom'
      customStartDate?: string
      customEndDate?: string
    }) => {
      const now = new Date()
      let startDate: Date
      let endDate: Date

      switch (range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 1)
          break
        case 'tomorrow':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 1)
          break
        case 'this_week': {
          const day = now.getDay()
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 7)
          break
        }
        case 'next_week': {
          const d = now.getDay()
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + 7)
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 7)
          break
        }
        case 'custom':
          if (!customStartDate || !customEndDate) {
            return { success: false, message: 'Custom range requires start and end dates.' }
          }
          startDate = new Date(customStartDate)
          endDate = new Date(customEndDate)
          endDate.setDate(endDate.getDate() + 1) // Include end date
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 1)
      }

      const appointments = await getSchedule(supabase, tenantId, startDate, endDate)

      if (appointments.length === 0) {
        return {
          success: true,
          count: 0,
          message: `No appointments scheduled for ${range === 'custom' ? `${customStartDate} to ${customEndDate}` : range.replace('_', ' ')}.`,
          appointments: [],
        }
      }

      const formatted = appointments.map((a: any) => ({
        id: a.id,
        title: a.title,
        client: a.clients?.name || 'No client',
        service: a.services?.name || null,
        date: new Date(a.starts_at).toLocaleDateString(),
        startTime: new Date(a.starts_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        endTime: new Date(a.ends_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: a.status,
        notes: a.notes,
      }))

      return {
        success: true,
        count: formatted.length,
        range: range === 'custom' ? `${customStartDate} to ${customEndDate}` : range.replace('_', ' '),
        appointments: formatted,
      }
    },
  })
}
