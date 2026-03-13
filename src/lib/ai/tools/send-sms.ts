import { tool } from 'ai'
import { z } from 'zod'
import { SupabaseClient } from '@supabase/supabase-js'
import { sendSms } from '@/lib/twilio/client'
import { BusinessContext } from '../context-builder'

export function sendSmsTool(
  context: BusinessContext,
  supabase: SupabaseClient,
  tenantId: string
) {
  return tool({
    description:
      'Send an SMS text message to a client. Use when the owner asks to text a client, send a reminder, or notify someone by SMS.',
    inputSchema: z.object({
      clientName: z.string().describe('Name of the client to text'),
      message: z.string().describe('The message to send'),
    }),
    execute: async ({ clientName, message }: { clientName: string; message: string }) => {
      // Find client by name to get phone number
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('tenant_id', tenantId)
        .ilike('name', `%${clientName}%`)
        .limit(3)

      if (!clients || clients.length === 0) {
        return { success: false, message: `No client found matching "${clientName}". Try searching for them first.` }
      }

      const client = clients[0]
      if (!client.phone) {
        return { success: false, message: `${client.name} doesn't have a phone number on file.` }
      }

      try {
        await sendSms(client.phone, message)
        return {
          success: true,
          message: `SMS sent to ${client.name} at ${client.phone}`,
          recipientName: client.name,
          recipientPhone: client.phone,
        }
      } catch (err: any) {
        return { success: false, message: `Failed to send SMS: ${err.message}` }
      }
    },
  })
}
